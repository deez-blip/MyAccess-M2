import assert from "node:assert/strict";
import test from "node:test";
import {
  accessibilityData,
  buildImportDataset,
  locationKeyFromParts,
  parseCsv,
} from "./importHealthcareEstablishments.js";

test("parses semicolon CSV with quoted delimiters", () => {
  const rows = parseCsv('id;name;site_internet\n1;"Centre; test";https://example.fr\n');

  assert.deepEqual(rows, [
    ["id", "name", "site_internet"],
    ["1", "Centre; test", "https://example.fr"],
  ]);
});

test("maps establishments to existing locations by normalized address", () => {
  const existingLocations = [
    {
      id: "loc_existing",
      address: "11 place Michel de l'Hospital",
      postal_code: "63000",
      city: "Clermont Ferrand",
    },
  ];
  const rows = [
    {
      id: "access-1",
      name: "11 MICHEL DE L'HOSPITAL",
      postal_code: "63000",
      commune: "Clermont-Ferrand",
      numero: "11",
      voie: "place Michel de l'Hospital",
      lieu_dit: "",
      code_insee: "63113",
      siret: "",
      activite: "Hôpital",
      contact_url: "",
      site_internet: "https://hopital.example.fr",
      longitude: "3.089554",
      latitude: "45.777483",
      labels: "[]",
      labels_familles_handicap: "[]",
      conformite: "",
      rnb_id: "A8NTN9JMAG6R",
      entree_plain_pied: "True",
      sanitaires_adaptes: "False",
    },
  ];

  const dataset = buildImportDataset(rows, existingLocations);

  assert.equal(dataset.matchedExistingLocations, 1);
  assert.equal(dataset.newLocations.length, 0);
  assert.equal(dataset.establishments.length, 1);
  assert.equal(dataset.establishments[0].location_id, "loc_existing");
  assert.deepEqual(dataset.establishments[0].accessibility_data, {
    entree_plain_pied: true,
    sanitaires_adaptes: false,
  });
  assert.equal(dataset.digitalAccessRows[0].website_url, "https://hopital.example.fr");
});

test("groups multiple CSV establishments at one new address into one location", () => {
  const rows = [
    {
      id: "first-id",
      name: "Laboratoire A",
      postal_code: "75001",
      commune: "Paris",
      numero: "1",
      voie: "Rue de Rivoli",
      lieu_dit: "",
      activite: "Laboratoire d'analyse médicale",
      longitude: "2.341",
      latitude: "48.86",
      labels: "[]",
      labels_familles_handicap: "[]",
    },
    {
      id: "second-id",
      name: "Centre B",
      postal_code: "75001",
      commune: "Paris",
      numero: "1",
      voie: "rue de Rivoli",
      lieu_dit: "",
      activite: "Centre médical",
      longitude: "2.341",
      latitude: "48.86",
      labels: "[]",
      labels_familles_handicap: "[]",
    },
  ];

  const dataset = buildImportDataset(rows, []);
  const locationKey = locationKeyFromParts("1 Rue de Rivoli", "75001", "Paris");

  assert.equal(dataset.groupedLocationCount, 1);
  assert.equal(dataset.newLocations.length, 1);
  assert.equal(dataset.newLocations[0].id, "accesslibre_first-id");
  assert.deepEqual(dataset.newLocations[0].professions, {
    "Laboratoire d'analyse médicale": 1,
    "Centre médical": 1,
  });
  assert.equal(dataset.establishments[0].location_id, dataset.newLocations[0].id);
  assert.equal(dataset.establishments[1].location_id, dataset.newLocations[0].id);
  assert.equal(locationKey, "1 R DE RIVOLI|75001|PARIS");
});

test("keeps non-core accessibility fields only", () => {
  const data = accessibilityData({
    id: "source-id",
    name: "Ignored name",
    entree_largeur_mini: "80.0",
    entree_plain_pied: "True",
    accueil_classes_accessibilite: "A",
  });

  assert.deepEqual(data, {
    entree_largeur_mini: 80,
    entree_plain_pied: true,
    accueil_classes_accessibilite: "A",
  });
});
