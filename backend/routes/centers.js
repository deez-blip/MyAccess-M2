import express from "express";
import sql from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { calculateDigitalAvailabilityScore } from "../services/healthcareDigitalAccess.js";
import { recomputeHealthcarePlaceReviewSignals } from "../services/healthcarePlaces.js";

const router = express.Router();
const HANDICAP_MIN_SCORE_DEFAULT = 2.5;
const HANDICAP_SCORE_PROFILES = {
  moteur: ["wheelchair", "walking_difficulty"],
  sensoriel: ["low_vision", "blind", "hearing"],
  mental: ["intellectual"],
  psychique: ["psychological"],
  cognitif: ["autism"],
};
const DATA_SOURCE_FILTERS = new Set([
  "all",
  "practitioners",
  "establishments",
  "mixed",
]);
const DIGITAL_ACCESS_FILTERS = new Set([
  "all",
  "online_booking",
  "website",
  "doctolib",
]);
const ALLOWED_REVIEW_ITEM_STATUSES = new Set([
  "confirmed_present",
  "reported_absent",
  "reported_present",
  "custom_present",
]);
const ACCESSIBILITY_CRITERIA = [
  {
    key: "wheelchair_access",
    label: "Accès en fauteuil roulant",
    handicapTypes: ["moteur"],
    profiles: ["wheelchair"],
  },
  {
    key: "walking_difficulty",
    label: "Cheminement adapté",
    handicapTypes: ["moteur"],
    profiles: ["walking_difficulty"],
  },
  {
    key: "adapted_toilets",
    label: "Sanitaires adaptés",
    handicapTypes: ["moteur"],
    profiles: ["wheelchair", "obesity"],
  },
  {
    key: "visual_guidance",
    label: "Guidage visuel",
    handicapTypes: ["sensoriel"],
    profiles: ["low_vision", "blind"],
  },
  {
    key: "hearing_support",
    label: "Équipement pour personnes malentendantes",
    handicapTypes: ["sensoriel"],
    profiles: ["hearing"],
  },
  {
    key: "cognitive_support",
    label: "Accueil adapté handicap mental ou cognitif",
    handicapTypes: ["mental", "cognitif"],
    profiles: ["intellectual", "autism"],
  },
  {
    key: "quiet_space",
    label: "Espace calme ou accueil apaisé",
    handicapTypes: ["psychique", "cognitif"],
    profiles: ["psychological", "autism"],
  },
  {
    key: "digital_booking",
    label: "Prise de rendez-vous en ligne",
    handicapTypes: ["moteur", "sensoriel", "cognitif"],
    isPresent: (_profileCounts, digitalAccess) =>
      Boolean(digitalAccess.hasOnlineBooking || digitalAccess.hasDoctolib),
  },
  {
    key: "website",
    label: "Site web renseigné",
    handicapTypes: ["moteur", "sensoriel", "cognitif"],
    isPresent: (_profileCounts, digitalAccess) =>
      Boolean(digitalAccess.hasWebsite),
  },
];

function roundScore(value) {
  return Math.round(value * 10) / 10;
}

function sanitizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function slugifyKey(value) {
  const slug = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return slug || "aide_accessibilite";
}

function normalizeHandicapTypes(values) {
  const allowedHandicapTypes = new Set(Object.keys(HANDICAP_SCORE_PROFILES));
  const rawValues = Array.isArray(values) ? values : parseListParam(values);

  return Array.from(
    new Set(
      rawValues
        .map((value) => String(value || "").trim())
        .filter((value) => allowedHandicapTypes.has(value))
    )
  );
}

function buildAccessibilityCriteria(profileCounts = {}, digitalAccess = {}) {
  return ACCESSIBILITY_CRITERIA.map((criterion) => {
    const present =
      typeof criterion.isPresent === "function"
        ? criterion.isPresent(profileCounts, digitalAccess)
        : (criterion.profiles || []).some(
            (profile) => Number(profileCounts[profile] || 0) > 0
          );

    return {
      key: criterion.key,
      label: criterion.label,
      handicapTypes: criterion.handicapTypes,
      present,
    };
  });
}

function reviewSignalsToFrontend(reviewSignals = {}) {
  const scoreDeltas = reviewSignals.scoreDeltas || {};
  const handicapDeltas = reviewSignals.handicapDeltas || {};

  return {
    reviewCount: Number(reviewSignals.reviewCount || 0),
    confirmedCount: Number(reviewSignals.confirmedCount || 0),
    positiveCount: Number(reviewSignals.positiveCount || 0),
    absentCount: Number(reviewSignals.absentCount || 0),
    customCount: Number(reviewSignals.customCount || 0),
    scoreDeltas: {
      physique: roundScore(Number(scoreDeltas.physique || 0)),
      numerique: roundScore(Number(scoreDeltas.numerique || 0)),
      accueil: roundScore(Number(scoreDeltas.accueil || 0)),
    },
    handicapDeltas: Object.fromEntries(
      Object.keys(HANDICAP_SCORE_PROFILES).map((handicapType) => [
        handicapType,
        roundScore(Number(handicapDeltas[handicapType] || 0)),
      ])
    ),
  };
}

function inferReviewRating(items) {
  const reportedAbsentCount = items.filter(
    (item) => item.status === "reported_absent"
  ).length;

  if (reportedAbsentCount >= 4) return 1;
  if (reportedAbsentCount === 3) return 2;
  if (reportedAbsentCount === 2) return 3;
  if (reportedAbsentCount === 1) return 4;
  return 5;
}

function mapHealthcareReviewToFrontend(review) {
  const rating = Number(review.rating || 5);
  const items = Array.isArray(review.items) ? review.items : [];
  const placeId = review.place_id || review.location_id;
  const handicapTypes = Array.from(
    new Set(
      items.flatMap((item) =>
        Array.isArray(item.handicapTypes) ? item.handicapTypes : []
      )
    )
  );

  return {
    id: String(review.id),
    userId: String(review.user_id),
    userName: review.user_name || review.email || "Utilisateur",
    centerId: `healthcare:${placeId}`,
    date: review.created_at?.toISOString?.() || review.created_at,
    scores: {
      physique: rating,
      numerique: rating,
      accueil: rating,
    },
    comment: review.comment || "",
    handicapTypes,
    helpfulCount: 0,
    accessibilityItems: items,
  };
}

async function getHealthcareReviewsByLocationIds(locationIds) {
  const uniqueLocationIds = Array.from(new Set(locationIds.filter(Boolean)));
  if (uniqueLocationIds.length === 0) return new Map();

  const reviews = await sql`
    SELECT
      r.id,
      r.place_id,
      r.place_id AS location_id,
      r.user_id,
      r.comment,
      r.rating,
      r.items,
      r.created_at,
      r.updated_at,
      u.email,
      NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), '') AS user_name
    FROM healthcare_place_reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.place_id IN ${sql(uniqueLocationIds)}
    ORDER BY r.created_at DESC
  `;

  return reviews.reduce((byLocationId, review) => {
    const mappedReview = mapHealthcareReviewToFrontend(review);
    const locationReviews = byLocationId.get(review.place_id) || [];
    locationReviews.push(mappedReview);
    byLocationId.set(review.place_id, locationReviews);
    return byLocationId;
  }, new Map());
}

async function ensureLocalUser(authUser) {
  const metadata = authUser.user_metadata || {};

  await sql`
    INSERT INTO users (
      id,
      email,
      first_name,
      last_name,
      handicap_type
    )
    VALUES (
      ${authUser.id},
      ${authUser.email || ""},
      ${metadata.first_name || null},
      ${metadata.last_name || null},
      ${metadata.handicap_type || null}
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, users.first_name),
      last_name = COALESCE(EXCLUDED.last_name, users.last_name),
      handicap_type = COALESCE(EXCLUDED.handicap_type, users.handicap_type),
      updated_at = NOW()
  `;
}

function buildHealthcareReviewPayload(body, location) {
  const comment = sanitizeText(body?.comment, 2000);
  if (!comment) {
    return { error: "Le commentaire est obligatoire" };
  }

  const digitalAccess = digitalAccessToFrontend(location.digital_access);
  const criteria = buildAccessibilityCriteria(
    location.profile_counts || {},
    digitalAccess
  );
  const criteriaByKey = new Map(
    criteria.map((criterion) => [criterion.key, criterion])
  );
  const submittedCriteria = Array.isArray(body?.criteria)
    ? body.criteria.slice(0, 50)
    : [];
  const customItems = Array.isArray(body?.customItems)
    ? body.customItems.slice(0, 20)
    : [];
  const reviewItems = [];

  for (const item of submittedCriteria) {
    const criterionKey = sanitizeText(
      item?.criterionKey || item?.key,
      100
    );
    const status = sanitizeText(item?.status, 40);
    const criterion = criteriaByKey.get(criterionKey);

    if (!criterion) {
      return { error: `Critère d'accessibilité inconnu: ${criterionKey}` };
    }

    if (!ALLOWED_REVIEW_ITEM_STATUSES.has(status) || status === "custom_present") {
      return { error: `Statut d'avis invalide: ${status}` };
    }

    const handicapTypes = normalizeHandicapTypes(item?.handicapTypes);
    reviewItems.push({
      criterion_key: criterion.key,
      label: criterion.label,
      status,
      handicap_types:
        handicapTypes.length > 0 ? handicapTypes : criterion.handicapTypes,
      comment: sanitizeText(item?.comment, 500) || null,
    });
  }

  for (const [index, item] of customItems.entries()) {
    const label = sanitizeText(item?.label, 160);
    const handicapTypes = normalizeHandicapTypes(item?.handicapTypes);

    if (!label) continue;
    if (handicapTypes.length === 0) {
      return {
        error:
          "Chaque aide ajoutée doit préciser au moins un type de handicap",
      };
    }

    reviewItems.push({
      criterion_key: `custom:${index}:${slugifyKey(label)}`,
      label,
      status: "custom_present",
      handicap_types: handicapTypes,
      comment: sanitizeText(item?.comment, 500) || null,
    });
  }

  const submittedRating = Number(body?.rating);
  const rating =
    Number.isInteger(submittedRating) && submittedRating >= 1 && submittedRating <= 5
      ? submittedRating
      : inferReviewRating(reviewItems);
  const storedReviewItems = reviewItems.map((item) => ({
    criterionKey: item.criterion_key,
    label: item.label,
    status: item.status,
    handicapTypes: item.handicap_types,
    comment: item.comment,
  }));

  return {
    comment,
    rating,
    storedReviewItems,
  };
}

function scoreHealthcareProfiles(profileCounts, accessibilitySubjectCount, digitalAccess) {
  if (!profileCounts || !accessibilitySubjectCount) {
    return {
      physique: 0,
      numerique: calculateDigitalAvailabilityScore(digitalAccess),
      accueil: 0,
    };
  }

  const ratio = (profile) => Math.min(1, Number(profileCounts[profile] || 0) / accessibilitySubjectCount);
  const physique = ((ratio("wheelchair") + ratio("walking_difficulty") + ratio("obesity")) / 3) * 5;
  const numerique = calculateDigitalAvailabilityScore(digitalAccess);
  const accueil =
    ((ratio("hearing") +
      ratio("intellectual") +
      ratio("psychological") +
      ratio("autism") +
      ratio("low_vision") +
      ratio("blind")) /
      6) *
    5;

  return {
    physique: roundScore(physique),
    numerique: roundScore(numerique),
    accueil: roundScore(accueil),
  };
}

function calculateHandicapScores(profileCounts = {}, accessibilitySubjectCount = 0) {
  const ratioScore = (profile) => {
    if (!accessibilitySubjectCount) return 0;
    return Math.min(5, (Number(profileCounts[profile] || 0) / accessibilitySubjectCount) * 5);
  };

  return Object.fromEntries(
    Object.entries(HANDICAP_SCORE_PROFILES).map(([handicapType, profiles]) => [
      handicapType,
      roundScore(Math.max(...profiles.map(ratioScore))),
    ])
  );
}

function digitalAccessToFrontend(digitalAccess = {}) {
  return {
    hasOnlineBooking: Boolean(digitalAccess.has_online_booking),
    hasDoctolib: Boolean(digitalAccess.has_doctolib),
    doctolibUrl: digitalAccess.doctolib_url || null,
    hasWebsite: Boolean(digitalAccess.has_website),
    websiteUrl: digitalAccess.website_url || null,
    hasTeleconsultation: Boolean(digitalAccess.has_teleconsultation),
    bookingMethods: digitalAccess.booking_methods || [],
    websiteAccessibilityStatus:
      digitalAccess.website_accessibility_status || "unknown",
    doctolibAccessibilityStatus:
      digitalAccess.doctolib_accessibility_status || "unknown",
    confidence: Number(digitalAccess.confidence || 0),
    source: digitalAccess.digital_access_source || digitalAccess.source || null,
    checkedAt: digitalAccess.checked_at?.toISOString?.() || digitalAccess.checked_at || null,
  };
}

function profileCountsToFrontend(profileCounts = {}, accessibilitySubjectCount = 0) {
  return Object.fromEntries(
    [
      "wheelchair",
      "walking_difficulty",
      "low_vision",
      "blind",
      "intellectual",
      "psychological",
      "autism",
      "hearing",
      "obesity",
    ].map((profile) => [
      profile,
      {
        relevantCount: Number(profileCounts[profile] || 0),
        score: accessibilitySubjectCount
          ? roundScore((Number(profileCounts[profile] || 0) / accessibilitySubjectCount) * 5)
          : 0,
      },
    ])
  );
}

function professionsToFrontend(professions = {}) {
  return Object.entries(professions)
    .map(([label, count]) => ({ label, count: Number(count || 0) }))
    .filter((profession) => profession.label && profession.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function mapHealthcareLocationToFrontend(location, reviews = []) {
  const practitionerCount = Number(location.link_count || location.practitioner_count || 0);
  const establishmentCount = Number(location.establishment_count || 0);
  const accessibilitySubjectCount = Number(
    location.accessibility_subject_count || practitionerCount + establishmentCount
  );
  const profileCounts = location.profile_counts || {};
  const digitalAccess = digitalAccessToFrontend(location.digital_access);
  const precomputedScore = location.accessibility_score || {};
  const accessibilityScore =
    precomputedScore.physique !== undefined
      ? {
          physique: Number(precomputedScore.physique || 0),
          numerique: Number(precomputedScore.numerique || 0),
          accueil: Number(precomputedScore.accueil || 0),
        }
      : scoreHealthcareProfiles(profileCounts, accessibilitySubjectCount, digitalAccess);
  const globalScore =
    location.global_score !== undefined
      ? Number(location.global_score)
      : Math.round(
          ((accessibilityScore.physique + accessibilityScore.numerique + accessibilityScore.accueil) / 3) *
            10
        ) / 10;
  const organizationNames = location.organization_names || [];
  const establishmentNames = location.establishment_names || [];
  const firstOrganizationName = organizationNames.find(Boolean);
  const firstEstablishmentName = establishmentNames.find(Boolean);
  const name =
    location.name ||
    (practitionerCount > 1
      ? `${firstOrganizationName || "Lieu de soins"} (${practitionerCount} praticiens)`
      : firstOrganizationName ||
        (establishmentCount > 1 && firstEstablishmentName
          ? `${firstEstablishmentName} (${establishmentCount} établissements)`
          : firstEstablishmentName) ||
        `Cabinet médical - ${location.city}`);

  const services = [];
  if (profileCounts.wheelchair > 0) services.push("Fauteuil roulant");
  if (profileCounts.walking_difficulty > 0) services.push("Marche difficile");
  if (profileCounts.low_vision > 0 || profileCounts.blind > 0) services.push("Déficience visuelle");
  if (profileCounts.hearing > 0) services.push("Déficience auditive");
  if (profileCounts.intellectual > 0) services.push("Déficience intellectuelle");
  if (profileCounts.psychological > 0) services.push("Handicap psychique");
  if (profileCounts.autism > 0) services.push("TSA");
  if (profileCounts.obesity > 0) services.push("Obésité");
  if (practitionerCount > 0) services.push("Source Santé.fr");
  if (establishmentCount > 0) services.push("Source AccessLibre");

  return {
    id: `healthcare:${location.id}`,
    name,
    address: location.address,
    city: location.city,
    postalCode: location.postal_code,
    latitude: parseFloat(location.latitude),
    longitude: parseFloat(location.longitude),
    phone: location.phone || "",
    email: location.email || "",
    website: digitalAccess.websiteUrl,
    hours: "Horaires non renseignés",
    type: "healthcare",
    source: "healthcare",
    offerTypes: ["healthcare"],
    locationKind: location.kind_guess || location.location_kind || null,
    professions: professionsToFrontend(location.professions),
    accessibilityProfiles: profileCountsToFrontend(profileCounts, accessibilitySubjectCount),
    accessibilityHandicapScores:
      location.handicap_scores || calculateHandicapScores(profileCounts, accessibilitySubjectCount),
    digitalAccess,
    accessibilityCriteria: buildAccessibilityCriteria(profileCounts, digitalAccess),
    reviewSignals: reviewSignalsToFrontend(location.review_signals),
    accessibilityScore,
    globalScore,
    reviews,
    services,
  };
}

function parseListParam(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseHandicapTypes(value) {
  const allowedHandicapTypes = new Set(Object.keys(HANDICAP_SCORE_PROFILES));
  return parseListParam(value).filter((handicapType) =>
    allowedHandicapTypes.has(handicapType)
  );
}

function parseHandicapMinScore(value) {
  const parsedValue = Number.parseFloat(value);
  if (Number.isNaN(parsedValue)) return HANDICAP_MIN_SCORE_DEFAULT;
  return Math.max(0, Math.min(5, parsedValue));
}

function parseEnumParam(value, allowedValues, fallback = "all") {
  const parsedValue = String(value || fallback);
  return allowedValues.has(parsedValue) ? parsedValue : fallback;
}

function buildDataSourceCondition(dataSource) {
  if (dataSource === "practitioners") {
    return sql`AND si.practitioner_count > 0`;
  }
  if (dataSource === "establishments") {
    return sql`AND si.establishment_count > 0`;
  }
  if (dataSource === "mixed") {
    return sql`AND si.practitioner_count > 0 AND si.establishment_count > 0`;
  }

  return sql``;
}

function buildDigitalAccessCondition(digitalAccess) {
  if (digitalAccess === "online_booking") {
    return sql`AND si.has_online_booking = true`;
  }
  if (digitalAccess === "website") {
    return sql`AND si.has_website = true`;
  }
  if (digitalAccess === "doctolib") {
    return sql`AND si.has_doctolib = true`;
  }

  return sql``;
}

function buildSearchIndexWhereCondition({
  locationKind,
  profession,
  dataSource,
  digitalAccess,
}) {
  const locationKindCondition =
    locationKind && locationKind !== "all"
      ? sql`AND si.location_kind = ${locationKind}`
      : sql``;
  const professionCondition =
    profession && profession !== "all"
      ? sql`AND si.profession_labels @> ARRAY[${profession}]::TEXT[]`
      : sql``;
  const dataSourceCondition = buildDataSourceCondition(dataSource);
  const digitalAccessCondition = buildDigitalAccessCondition(digitalAccess);

  return sql`${locationKindCondition} ${professionCondition} ${dataSourceCondition} ${digitalAccessCondition}`;
}

function handicapScoreCondition(handicapType, handicapMinScore) {
  if (handicapType === "moteur") {
    return sql`si.moteur_score >= ${handicapMinScore}`;
  }
  if (handicapType === "sensoriel") {
    return sql`si.sensoriel_score >= ${handicapMinScore}`;
  }
  if (handicapType === "mental") {
    return sql`si.mental_score >= ${handicapMinScore}`;
  }
  if (handicapType === "psychique") {
    return sql`si.psychique_score >= ${handicapMinScore}`;
  }
  if (handicapType === "cognitif") {
    return sql`si.cognitif_score >= ${handicapMinScore}`;
  }

  return sql`FALSE`;
}

function buildSearchIndexHandicapCondition({ handicapTypes, handicapMinScore }) {
  if (handicapTypes.length === 0) return sql``;

  const conditions = handicapTypes.map((handicapType) =>
    sql`(${handicapScoreCondition(handicapType, handicapMinScore)})`
  );
  const combinedConditions = conditions
    .slice(1)
    .reduce((combined, condition) => sql`${combined} AND ${condition}`, conditions[0]);

  return sql`AND ${combinedConditions}`;
}

function adjustedHandicapScoreCondition(handicapType, handicapMinScore) {
  if (handicapType === "moteur") {
    return sql`ranked.adjusted_moteur_score >= ${handicapMinScore}`;
  }
  if (handicapType === "sensoriel") {
    return sql`ranked.adjusted_sensoriel_score >= ${handicapMinScore}`;
  }
  if (handicapType === "mental") {
    return sql`ranked.adjusted_mental_score >= ${handicapMinScore}`;
  }
  if (handicapType === "psychique") {
    return sql`ranked.adjusted_psychique_score >= ${handicapMinScore}`;
  }
  if (handicapType === "cognitif") {
    return sql`ranked.adjusted_cognitif_score >= ${handicapMinScore}`;
  }

  return sql`FALSE`;
}

function buildAdjustedHandicapCondition({ handicapTypes, handicapMinScore }) {
  if (handicapTypes.length === 0) return sql``;

  const conditions = handicapTypes.map((handicapType) =>
    sql`(${adjustedHandicapScoreCondition(handicapType, handicapMinScore)})`
  );
  const combinedConditions = conditions
    .slice(1)
    .reduce((combined, condition) => sql`${combined} AND ${condition}`, conditions[0]);

  return sql`AND ${combinedConditions}`;
}

function buildSearchIndexSearchCondition(search, mode) {
  const query = String(search || "").trim();
  if (!query) return sql``;

  const wildcard = `%${query}%`;
  const cityPrefix = `${query} %`;
  const postalPrefix = /^\d{2,5}$/.test(query) ? `${query}%` : null;
  const parisPostalCondition =
    query.toLocaleLowerCase("fr-FR") === "paris" ? sql`OR si.postal_code LIKE '75%'` : sql``;

  if (mode === "location") {
    return sql`
      AND (
        si.city ILIKE ${query}
        OR si.city ILIKE ${cityPrefix}
        ${postalPrefix ? sql`OR si.postal_code LIKE ${postalPrefix}` : sql``}
        ${parisPostalCondition}
      )
    `;
  }

  return sql`
    AND (
      si.search_vector @@ plainto_tsquery('simple', ${query})
      OR si.search_text ILIKE ${wildcard}
    )
  `;
}

async function queryHealthcareLocations({
  search,
  searchMode,
  limit,
  offset,
  locationKind,
  profession,
  dataSource,
  digitalAccess,
  handicapTypes,
  handicapMinScore,
  locationId,
}) {
  const parsedLimit = Math.min(parseInt(limit) || 50, 500);
  const parsedOffset = parseInt(offset) || 0;
  const query = String(search || "").trim();
  const idCondition = locationId ? sql`AND si.id = ${locationId}` : sql``;
  const searchCondition = buildSearchIndexSearchCondition(search, searchMode);
  const filterCondition = buildSearchIndexWhereCondition({
    locationKind,
    profession,
    dataSource,
    digitalAccess,
  });
  const handicapCondition = buildSearchIndexHandicapCondition({
    handicapTypes,
    handicapMinScore,
  });
  const searchColumns =
    query && searchMode === "global"
      ? sql`
        ts_rank(si.search_vector, plainto_tsquery('simple', ${query})) AS search_rank,
        similarity(si.search_text, ${query}) AS search_similarity
      `
      : sql`
        0::REAL AS search_rank,
        0::REAL AS search_similarity
      `;
  const searchOrder =
    query && searchMode === "global"
      ? sql`
        filtered.search_rank DESC,
        filtered.search_similarity DESC,
      `
      : sql``;

  return sql`
    WITH filtered AS (
      SELECT
        si.*,
        ${searchColumns}
      FROM healthcare_places si
      WHERE TRUE
        ${idCondition}
        ${searchCondition}
        ${filterCondition}
        ${handicapCondition}
    )
    SELECT
      filtered.id,
      filtered.id AS location_id,
      filtered.name,
      filtered.address,
      filtered.postal_code,
      filtered.city,
      filtered.latitude,
      filtered.longitude,
      filtered.location_kind,
      filtered.professions,
      filtered.profession_labels,
      filtered.organization_names,
      filtered.establishment_names,
      filtered.phone,
      filtered.email,
      filtered.website_url,
      filtered.has_online_booking,
      filtered.has_doctolib,
      filtered.has_website,
      filtered.practitioner_count,
      filtered.practitioner_count AS link_count,
      filtered.establishment_count,
      filtered.accessibility_subject_count,
      filtered.profile_counts,
      filtered.accessibility_score,
      filtered.handicap_scores,
      filtered.global_score,
      filtered.digital_access,
      filtered.review_signals
    FROM filtered
    ORDER BY
      ${searchOrder}
      filtered.ranking_score DESC,
      filtered.global_score DESC,
      filtered.accessibility_subject_count DESC,
      filtered.geocoding_score DESC NULLS LAST,
      filtered.id ASC
    LIMIT ${parsedLimit}
    OFFSET ${parsedOffset}
  `;
}

async function getHealthcareLocations(options) {
  const query = String(options.search || "").trim();
  const baseOptions = {
    ...options,
    handicapTypes: options.handicapTypes || [],
    handicapMinScore: options.handicapMinScore ?? HANDICAP_MIN_SCORE_DEFAULT,
  };

  if (!query || options.locationId) {
    return queryHealthcareLocations({ ...baseOptions, searchMode: "global" });
  }

  const locationResults = await queryHealthcareLocations({
    ...baseOptions,
    searchMode: "location",
  });

  if (locationResults.length > 0) {
    return locationResults;
  }

  return queryHealthcareLocations({ ...baseOptions, searchMode: "global" });
}

function parseHealthcareQueryFilters(query) {
  return {
    search: query.search,
    locationKind: query.locationKind || "all",
    profession: query.profession || "all",
    dataSource: parseEnumParam(query.dataSource, DATA_SOURCE_FILTERS),
    digitalAccess: parseEnumParam(query.digitalAccess, DIGITAL_ACCESS_FILTERS),
    handicapTypes: parseHandicapTypes(query.handicapTypes),
    handicapMinScore: parseHandicapMinScore(query.handicapMinScore),
  };
}

function buildFacetCondition(filters, excludedFacet) {
  const searchCondition = buildSearchIndexSearchCondition(filters.search, "global");
  const filterCondition = buildSearchIndexWhereCondition({
    locationKind: excludedFacet === "locationKind" ? "all" : filters.locationKind,
    profession: excludedFacet === "profession" ? "all" : filters.profession,
    dataSource: excludedFacet === "dataSource" ? "all" : filters.dataSource,
    digitalAccess: excludedFacet === "digitalAccess" ? "all" : filters.digitalAccess,
  });
  const handicapCondition = buildSearchIndexHandicapCondition({
    handicapTypes: filters.handicapTypes || [],
    handicapMinScore: filters.handicapMinScore ?? HANDICAP_MIN_SCORE_DEFAULT,
  });

  return sql`${searchCondition} ${filterCondition} ${handicapCondition}`;
}

async function getHealthcareFacets(filters = {}) {
  const dataSourceCondition = buildFacetCondition(filters, "dataSource");
  const digitalAccessCondition = buildFacetCondition(filters, "digitalAccess");
  const locationKindCondition = buildFacetCondition(filters, "locationKind");
  const professionCondition = buildFacetCondition(filters, "profession");

  const [sourceCounts] = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE practitioner_count > 0)::int AS practitioners,
      COUNT(*) FILTER (WHERE establishment_count > 0)::int AS establishments,
      COUNT(*) FILTER (WHERE practitioner_count > 0 AND establishment_count > 0)::int AS mixed
    FROM healthcare_places si
    WHERE TRUE
      ${dataSourceCondition}
  `;
  const [digitalCounts] = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE has_online_booking)::int AS online_booking,
      COUNT(*) FILTER (WHERE has_website)::int AS website,
      COUNT(*) FILTER (WHERE has_doctolib)::int AS doctolib
    FROM healthcare_places si
    WHERE TRUE
      ${digitalAccessCondition}
  `;
  const locationKinds = await sql`
    SELECT si.location_kind AS value, COUNT(*)::int AS count
    FROM healthcare_places si
    WHERE TRUE
      ${locationKindCondition}
      AND si.location_kind IS NOT NULL
    GROUP BY location_kind
    ORDER BY count DESC, value ASC
  `;
  const [locationKindTotal] = await sql`
    SELECT COUNT(*)::int AS total
    FROM healthcare_places si
    WHERE TRUE
      ${locationKindCondition}
  `;
  const professions = await sql`
    SELECT label AS value, COUNT(*)::int AS count
    FROM healthcare_places si
    CROSS JOIN LATERAL UNNEST(si.profession_labels) AS label
    WHERE TRUE
      ${professionCondition}
      AND label IS NOT NULL
      AND label <> ''
    GROUP BY label
    HAVING COUNT(*) >= 2
    ORDER BY count DESC, label ASC
    LIMIT 60
  `;
  const [professionTotal] = await sql`
    SELECT COUNT(*)::int AS total
    FROM healthcare_places si
    WHERE TRUE
      ${professionCondition}
  `;

  return {
    dataSources: [
      { value: "all", count: sourceCounts.total },
      { value: "practitioners", count: sourceCounts.practitioners },
      { value: "establishments", count: sourceCounts.establishments },
      { value: "mixed", count: sourceCounts.mixed },
    ],
    digitalAccess: [
      { value: "all", count: digitalCounts.total },
      { value: "online_booking", count: digitalCounts.online_booking },
      { value: "website", count: digitalCounts.website },
      { value: "doctolib", count: digitalCounts.doctolib },
    ],
    locationKinds: [
      { value: "all", count: locationKindTotal.total },
      ...locationKinds,
    ],
    professions: [
      { value: "all", count: professionTotal.total },
      ...professions,
    ],
  };
}

router.get("/", async (req, res) => {
  try {
    const {
      search,
      limit = 50,
      offset = 0,
      offerType = "all",
      locationKind = "all",
      profession = "all",
      dataSource,
      digitalAccess,
      handicapTypes,
      handicapMinScore,
    } = req.query;

    if (offerType !== "all" && offerType !== "healthcare") {
      return res.json([]);
    }

    const healthcareLocations = await getHealthcareLocations({
      search,
      limit,
      offset,
      locationKind,
      profession,
      dataSource: parseEnumParam(dataSource, DATA_SOURCE_FILTERS),
      digitalAccess: parseEnumParam(digitalAccess, DIGITAL_ACCESS_FILTERS),
      handicapTypes: parseHandicapTypes(handicapTypes),
      handicapMinScore: parseHandicapMinScore(handicapMinScore),
    });

    res.json(
      healthcareLocations.map((location) =>
        mapHealthcareLocationToFrontend(location)
      )
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des centres:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des centres" });
  }
});

router.get("/facets", async (req, res) => {
  try {
    res.json(await getHealthcareFacets(parseHealthcareQueryFilters(req.query)));
  } catch (error) {
    console.error("Erreur lors de la récupération des filtres:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des filtres" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (id.startsWith("healthcare:")) {
      const locationId = id.replace("healthcare:", "");
      const healthcareLocations = await getHealthcareLocations({
        locationId,
        limit: 1,
        offset: 0,
        locationKind: "all",
        profession: "all",
        handicapTypes: [],
        handicapMinScore: HANDICAP_MIN_SCORE_DEFAULT,
      });

      if (healthcareLocations.length === 0) {
        return res.status(404).json({ error: "Centre non trouvé" });
      }

      const reviewsByLocationId = await getHealthcareReviewsByLocationIds([locationId]);

      return res.json(
        mapHealthcareLocationToFrontend(
          healthcareLocations[0],
          reviewsByLocationId.get(locationId) || []
        )
      );
    }

    res.status(404).json({ error: "Lieu non supporté" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du centre" });
  }
});

router.post("/:id/reviews", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.startsWith("healthcare:")) {
      return res.status(400).json({
        error: "Les avis ne sont supportés que pour les lieux healthcare",
      });
    }

    const locationId = id.replace("healthcare:", "");
    const healthcareLocations = await getHealthcareLocations({
      locationId,
      limit: 1,
      offset: 0,
      locationKind: "all",
      profession: "all",
      handicapTypes: [],
      handicapMinScore: HANDICAP_MIN_SCORE_DEFAULT,
    });

    if (healthcareLocations.length === 0) {
      return res.status(404).json({ error: "Centre non trouvé" });
    }

    const location = healthcareLocations[0];
    const reviewPayload = buildHealthcareReviewPayload(req.body, location);
    if (reviewPayload.error) {
      return res.status(400).json({ error: reviewPayload.error });
    }

    await ensureLocalUser(req.user);

    const savedReview = await sql.begin(async (transaction) => {
      const [review] = await transaction`
        INSERT INTO healthcare_place_reviews (
          place_id,
          user_id,
          comment,
          rating,
          items,
          updated_at
        )
        VALUES (
          ${locationId},
          ${req.user.id},
          ${reviewPayload.comment},
          ${reviewPayload.rating},
          ${transaction.json(reviewPayload.storedReviewItems)},
          NOW()
        )
        RETURNING *
      `;

      return review;
    });

    await recomputeHealthcarePlaceReviewSignals(locationId);

    const reviewsByLocationId = await getHealthcareReviewsByLocationIds([locationId]);
    const savedFrontendReview = (reviewsByLocationId.get(locationId) || []).find(
      (review) => review.id === String(savedReview.id)
    );

    res.status(201).json(savedFrontendReview || mapHealthcareReviewToFrontend(savedReview));
  } catch (error) {
    console.error("Erreur lors de la publication de l'avis:", error);
    res.status(500).json({ error: "Erreur lors de la publication de l'avis" });
  }
});

router.put("/:id/reviews/:reviewId", authenticateToken, async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    if (!id.startsWith("healthcare:")) {
      return res.status(400).json({
        error: "Les avis ne sont supportés que pour les lieux healthcare",
      });
    }

    const locationId = id.replace("healthcare:", "");
    const healthcareLocations = await getHealthcareLocations({
      locationId,
      limit: 1,
      offset: 0,
      locationKind: "all",
      profession: "all",
      handicapTypes: [],
      handicapMinScore: HANDICAP_MIN_SCORE_DEFAULT,
    });

    if (healthcareLocations.length === 0) {
      return res.status(404).json({ error: "Centre non trouvé" });
    }

    const [existingReview] = await sql`
      SELECT id, place_id, user_id
      FROM healthcare_place_reviews
      WHERE id = ${reviewId}
        AND place_id = ${locationId}
    `;

    if (!existingReview) {
      return res.status(404).json({ error: "Avis non trouvé" });
    }

    if (String(existingReview.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Vous ne pouvez modifier que vos avis" });
    }

    const reviewPayload = buildHealthcareReviewPayload(req.body, healthcareLocations[0]);
    if (reviewPayload.error) {
      return res.status(400).json({ error: reviewPayload.error });
    }

    await ensureLocalUser(req.user);

    const [savedReview] = await sql`
      UPDATE healthcare_place_reviews
      SET
        comment = ${reviewPayload.comment},
        rating = ${reviewPayload.rating},
        items = ${sql.json(reviewPayload.storedReviewItems)},
        updated_at = NOW()
      WHERE id = ${reviewId}
        AND place_id = ${locationId}
        AND user_id = ${req.user.id}
      RETURNING *
    `;

    await recomputeHealthcarePlaceReviewSignals(locationId);

    const reviewsByLocationId = await getHealthcareReviewsByLocationIds([locationId]);
    const savedFrontendReview = (reviewsByLocationId.get(locationId) || []).find(
      (review) => review.id === String(savedReview.id)
    );

    res.json(savedFrontendReview || mapHealthcareReviewToFrontend(savedReview));
  } catch (error) {
    console.error("Erreur lors de la modification de l'avis:", error);
    res.status(500).json({ error: "Erreur lors de la modification de l'avis" });
  }
});

router.delete("/:id/reviews/:reviewId", authenticateToken, async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    if (!id.startsWith("healthcare:")) {
      return res.status(400).json({
        error: "Les avis ne sont supportés que pour les lieux healthcare",
      });
    }

    const locationId = id.replace("healthcare:", "");
    const [deletedReview] = await sql`
      DELETE FROM healthcare_place_reviews
      WHERE id = ${reviewId}
        AND place_id = ${locationId}
        AND user_id = ${req.user.id}
      RETURNING id
    `;

    if (!deletedReview) {
      return res.status(404).json({ error: "Avis non trouvé" });
    }

    await recomputeHealthcarePlaceReviewSignals(locationId);

    res.json({ deleted: true, id: String(deletedReview.id) });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'avis" });
  }
});

export default router;
