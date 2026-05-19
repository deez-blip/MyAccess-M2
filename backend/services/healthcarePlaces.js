import sql from "../config/db.js";

const HANDICAP_TYPES = [
  "moteur",
  "sensoriel",
  "mental",
  "psychique",
  "cognitif",
];
const PHYSICAL_CRITERIA = new Set([
  "wheelchair_access",
  "walking_difficulty",
  "adapted_toilets",
]);
const DIGITAL_CRITERIA = new Set(["digital_booking", "website"]);
const WELCOME_CRITERIA = new Set([
  "visual_guidance",
  "hearing_support",
  "cognitive_support",
  "quiet_space",
]);

function roundScore(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function clampScore(value) {
  return roundScore(Math.max(0, Math.min(5, Number(value || 0))));
}

function normalizeItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const handicapTypes = Array.isArray(item?.handicapTypes)
        ? item.handicapTypes
        : Array.isArray(item?.handicap_types)
          ? item.handicap_types
          : [];

      return {
        criterionKey: String(item?.criterionKey || item?.criterion_key || ""),
        label: String(item?.label || ""),
        status: String(item?.status || ""),
        handicapTypes: handicapTypes.filter((type) =>
          HANDICAP_TYPES.includes(type)
        ),
        comment: item?.comment || null,
      };
    })
    .filter((item) => item.criterionKey && item.status);
}

function createCounter() {
  return {
    positive: 0,
    confirmed: 0,
    absent: 0,
  };
}

function delta({ positive, confirmed, absent }, weights) {
  return (
    Math.min(1.2, positive * weights.positive + confirmed * weights.confirmed) -
    Math.min(2.5, absent * weights.absent)
  );
}

export function defaultReviewSignals() {
  return {
    reviewCount: 0,
    confirmedCount: 0,
    positiveCount: 0,
    absentCount: 0,
    customCount: 0,
    scoreDeltas: {
      physique: 0,
      numerique: 0,
      accueil: 0,
    },
    handicapDeltas: Object.fromEntries(
      HANDICAP_TYPES.map((handicapType) => [handicapType, 0])
    ),
  };
}

export function calculateReviewSignals(reviews = []) {
  const signals = defaultReviewSignals();
  const physical = createCounter();
  const digital = createCounter();
  const welcome = createCounter();
  const handicapCounters = Object.fromEntries(
    HANDICAP_TYPES.map((handicapType) => [handicapType, createCounter()])
  );

  signals.reviewCount = reviews.length;

  for (const review of reviews) {
    for (const item of normalizeItems(review.items)) {
      const positive =
        item.status === "reported_present" || item.status === "custom_present";
      const confirmed = item.status === "confirmed_present";
      const absent = item.status === "reported_absent";
      const custom = item.status === "custom_present";

      if (confirmed) signals.confirmedCount += 1;
      if (positive) signals.positiveCount += 1;
      if (absent) signals.absentCount += 1;
      if (custom) signals.customCount += 1;

      const touchesPhysical =
        PHYSICAL_CRITERIA.has(item.criterionKey) ||
        (custom && item.handicapTypes.includes("moteur"));
      const touchesDigital = DIGITAL_CRITERIA.has(item.criterionKey);
      const touchesWelcome =
        WELCOME_CRITERIA.has(item.criterionKey) ||
        (custom &&
          item.handicapTypes.some((type) => type !== "moteur"));

      for (const [touches, counter] of [
        [touchesPhysical, physical],
        [touchesDigital, digital],
        [touchesWelcome, welcome],
      ]) {
        if (!touches) continue;
        if (positive) counter.positive += 1;
        if (confirmed) counter.confirmed += 1;
        if (absent) counter.absent += 1;
      }

      for (const handicapType of item.handicapTypes) {
        const counter = handicapCounters[handicapType];
        if (!counter) continue;
        if (positive) counter.positive += 1;
        if (confirmed) counter.confirmed += 1;
        if (absent) counter.absent += 1;
      }
    }
  }

  signals.scoreDeltas = {
    physique: roundScore(
      delta(physical, { positive: 0.35, confirmed: 0.08, absent: 0.7 })
    ),
    numerique: roundScore(
      delta(digital, { positive: 0.4, confirmed: 0.08, absent: 0.7 })
    ),
    accueil: roundScore(
      delta(welcome, { positive: 0.3, confirmed: 0.06, absent: 0.6 })
    ),
  };
  signals.handicapDeltas = Object.fromEntries(
    HANDICAP_TYPES.map((handicapType) => [
      handicapType,
      roundScore(
        delta(handicapCounters[handicapType], {
          positive: 0.3,
          confirmed: 0.05,
          absent: 0.65,
        })
      ),
    ])
  );

  return signals;
}

function getBaseNumber(place, baseKey, fallbackKey) {
  return Number(place?.[baseKey] ?? place?.[fallbackKey] ?? 0);
}

export function applyReviewSignalsToPlace(place, reviewSignals) {
  const signals = reviewSignals || defaultReviewSignals();
  const physicalScore = clampScore(
    getBaseNumber(place, "base_physical_score", "physical_score") +
      Number(signals.scoreDeltas.physique || 0)
  );
  const digitalScore = clampScore(
    getBaseNumber(place, "base_digital_score", "digital_score") +
      Number(signals.scoreDeltas.numerique || 0)
  );
  const welcomeScore = clampScore(
    getBaseNumber(place, "base_welcome_score", "welcome_score") +
      Number(signals.scoreDeltas.accueil || 0)
  );
  const handicapScores = Object.fromEntries(
    HANDICAP_TYPES.map((handicapType) => [
      handicapType,
      clampScore(
        getBaseNumber(
          place,
          `base_${handicapType}_score`,
          `${handicapType}_score`
        ) + Number(signals.handicapDeltas[handicapType] || 0)
      ),
    ])
  );
  const rankingScore =
    getBaseNumber(place, "base_ranking_score", "ranking_score") +
    Math.min(
      1.5,
      signals.positiveCount * 0.12 +
        signals.customCount * 0.15 +
        signals.confirmedCount * 0.02
    ) -
    Math.min(3, signals.absentCount * 0.35);

  return {
    accessibilityScore: {
      physique: physicalScore,
      numerique: digitalScore,
      accueil: welcomeScore,
    },
    handicapScores,
    physicalScore,
    digitalScore,
    welcomeScore,
    globalScore: roundScore((physicalScore + digitalScore + welcomeScore) / 3),
    rankingScore: Number(rankingScore.toFixed(4)),
    reviewSignals: signals,
  };
}

export async function recomputeHealthcarePlaceReviewSignals(placeId, db = sql) {
  const [place] = await db`
    SELECT
      id,
      base_physical_score,
      physical_score,
      base_digital_score,
      digital_score,
      base_welcome_score,
      welcome_score,
      base_moteur_score,
      moteur_score,
      base_sensoriel_score,
      sensoriel_score,
      base_mental_score,
      mental_score,
      base_psychique_score,
      psychique_score,
      base_cognitif_score,
      cognitif_score,
      base_ranking_score,
      ranking_score
    FROM healthcare_places
    WHERE id = ${placeId}
  `;

  if (!place) return null;

  const reviews = await db`
    SELECT items
    FROM healthcare_place_reviews
    WHERE place_id = ${placeId}
  `;
  const recalculated = applyReviewSignalsToPlace(
    place,
    calculateReviewSignals(reviews)
  );

  const [updatedPlace] = await db`
    UPDATE healthcare_places
    SET
      accessibility_score = ${db.json(recalculated.accessibilityScore)},
      handicap_scores = ${db.json(recalculated.handicapScores)},
      physical_score = ${recalculated.physicalScore},
      digital_score = ${recalculated.digitalScore},
      welcome_score = ${recalculated.welcomeScore},
      global_score = ${recalculated.globalScore},
      moteur_score = ${recalculated.handicapScores.moteur},
      sensoriel_score = ${recalculated.handicapScores.sensoriel},
      mental_score = ${recalculated.handicapScores.mental},
      psychique_score = ${recalculated.handicapScores.psychique},
      cognitif_score = ${recalculated.handicapScores.cognitif},
      ranking_score = ${recalculated.rankingScore},
      review_signals = ${db.json(recalculated.reviewSignals)},
      updated_at = NOW()
    WHERE id = ${placeId}
    RETURNING *
  `;

  return updatedPlace || null;
}
