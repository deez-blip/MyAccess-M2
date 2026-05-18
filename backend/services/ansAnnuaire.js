const ANS_FHIR_BASE_URL =
  process.env.ANS_FHIR_BASE_URL || "https://gateway.api.esante.gouv.fr/fhir/v2";

export class AnsAnnuaireError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "AnsAnnuaireError";
    this.status = status;
    this.details = details;
  }
}

function getApiKey() {
  const apiKey = process.env.ANS_FHIR_API_KEY;

  if (!apiKey) {
    throw new AnsAnnuaireError(
      "ANS_FHIR_API_KEY est manquant dans la configuration backend",
      500
    );
  }

  return apiKey;
}

function buildUrl(resourcePath, query = {}) {
  const url = new URL(`${ANS_FHIR_BASE_URL}/${resourcePath}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item);
      }
    } else {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function fetchAnsFhir(resourcePath, query = {}) {
  const response = await fetch(buildUrl(resourcePath, query), {
    headers: {
      "ESANTE-API-KEY": getApiKey(),
      Accept: "application/fhir+json, application/json",
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AnsAnnuaireError(
      "Erreur lors de l'appel à l'Annuaire Santé ANS",
      response.status,
      payload
    );
  }

  return payload;
}

function getIdentifier(resource, code) {
  return resource.identifier?.find((identifier) =>
    identifier.type?.coding?.some((coding) => coding.code === code)
  )?.value;
}

function getAnyIdentifier(resource, codes) {
  for (const code of codes) {
    const value = getIdentifier(resource, code);
    if (value) return value;
  }

  return undefined;
}

function getTelecom(resource, system) {
  return resource.telecom?.find((telecom) => telecom.system === system)?.value;
}

function getCodingDisplay(codeableConcept) {
  return codeableConcept?.coding?.[0]?.display || codeableConcept?.text || null;
}

function getBundleResources(bundle, resourceType) {
  return (
    bundle.entry
      ?.map((entry) => entry.resource)
      .filter((resource) => resource?.resourceType === resourceType) || []
  );
}

export function simplifyPractitioner(practitioner) {
  const name = practitioner.name?.[0];

  return {
    id: practitioner.id,
    rpps: getIdentifier(practitioner, "RPPS"),
    idnps: getIdentifier(practitioner, "IDNPS"),
    active: practitioner.active,
    family: name?.family || null,
    given: name?.given || [],
    displayName: name?.text || [name?.given?.join(" "), name?.family].filter(Boolean).join(" "),
    qualifications:
      practitioner.qualification?.map((qualification) => ({
        code: qualification.code?.coding?.[0]?.code || null,
        label: getCodingDisplay(qualification.code),
      })) || [],
  };
}

export function simplifyPractitionerRole(role) {
  return {
    id: role.id,
    active: role.active,
    practitionerRef: role.practitioner?.reference || null,
    organizationRef: role.organization?.reference || null,
    organizationName: role.organization?.display || null,
    roles: role.code?.map(getCodingDisplay).filter(Boolean) || [],
    specialties: role.specialty?.map(getCodingDisplay).filter(Boolean) || [],
  };
}

export function simplifyOrganization(organization) {
  return {
    id: organization.id,
    finess: getAnyIdentifier(organization, ["FINEG", "FINEJ", "FINESS"]),
    idnst: getIdentifier(organization, "IDNST"),
    siret: getIdentifier(organization, "SIRET"),
    active: organization.active,
    name: organization.name || null,
    phone: getTelecom(organization, "phone") || null,
    email: getTelecom(organization, "email") || null,
    type: organization.type?.map(getCodingDisplay).filter(Boolean) || [],
    address:
      organization.address?.map((address) => ({
        line: address.line || [],
        city: address.city || null,
        postalCode: address.postalCode || null,
        country: address.country || null,
      })) || [],
  };
}

export async function searchPractitioners(query) {
  const bundle = await fetchAnsFhir("Practitioner", {
    identifier: query.identifier,
    family: query.family,
    given: query.given,
    name: query.name,
    active: query.active,
    _count: query.count || 10,
    _revinclude: "PractitionerRole:practitioner",
  });

  return {
    total: bundle.total || 0,
    practitioners: getBundleResources(bundle, "Practitioner").map(simplifyPractitioner),
    roles: getBundleResources(bundle, "PractitionerRole").map(simplifyPractitionerRole),
  };
}

export async function getOrganization(id) {
  const organization = await fetchAnsFhir(`Organization/${id}`);
  return simplifyOrganization(organization);
}

export async function searchOrganizations(query) {
  const bundle = await fetchAnsFhir("Organization", {
    identifier: query.identifier,
    "name:contains": query.name,
    active: query.active,
    _count: query.count || 10,
  });

  return {
    total: bundle.total || 0,
    organizations: getBundleResources(bundle, "Organization").map(simplifyOrganization),
  };
}
