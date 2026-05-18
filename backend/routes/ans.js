import express from "express";
import {
  AnsAnnuaireError,
  getOrganization,
  searchOrganizations,
  searchPractitioners,
} from "../services/ansAnnuaire.js";

const router = express.Router();

function parseCount(value) {
  const count = Number.parseInt(value, 10);
  if (Number.isNaN(count)) return 10;
  return Math.min(Math.max(count, 1), 50);
}

function handleAnsError(error, res) {
  if (error instanceof AnsAnnuaireError) {
    return res.status(error.status || 500).json({
      error: error.message,
      details: error.details,
    });
  }

  return res.status(500).json({
    error: "Erreur serveur lors de l'appel à l'Annuaire Santé",
  });
}

router.get("/practitioners", async (req, res) => {
  try {
    const { identifier, family, given, name, active, includeOrganizations } = req.query;

    const result = await searchPractitioners({
      identifier,
      family,
      given,
      name,
      active,
      count: parseCount(req.query.count),
    });

    if (includeOrganizations === "true") {
      const organizationIds = [
        ...new Set(
          result.roles
            .map((role) => role.organizationRef)
            .filter(Boolean)
            .map((ref) => ref.replace("Organization/", ""))
        ),
      ];

      result.organizations = await Promise.all(
        organizationIds.map((organizationId) => getOrganization(organizationId))
      );
    }

    res.json(result);
  } catch (error) {
    handleAnsError(error, res);
  }
});

router.get("/organizations", async (req, res) => {
  try {
    const { identifier, name, active } = req.query;

    const result = await searchOrganizations({
      identifier,
      name,
      active,
      count: parseCount(req.query.count),
    });

    res.json(result);
  } catch (error) {
    handleAnsError(error, res);
  }
});

export default router;
