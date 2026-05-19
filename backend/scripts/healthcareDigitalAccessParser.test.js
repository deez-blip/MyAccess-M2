import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDigitalAvailabilityScore,
  extractDigitalAccessFromTexts,
  mergeDigitalAccessSignals,
} from "../services/healthcareDigitalAccess.js";

test("detects Doctolib named as a site internet booking method", () => {
  const result = extractDigitalAccessFromTexts([
    "La prise de rendez-vous peut être faite de la façon suivante : site internet (Doctolib).",
  ]);

  assert.equal(result.hasOnlineBooking, true);
  assert.equal(result.hasDoctolib, true);
  assert.equal(result.hasWebsite, false);
  assert.deepEqual(result.bookingMethods, ["online_booking", "doctolib"]);
});

test("extracts a Doctolib URL", () => {
  const result = extractDigitalAccessFromTexts([
    "site internet (https://www.doctolib.fr/neurologue/lille/olivier-hoornaert).",
  ]);

  assert.equal(result.hasOnlineBooking, true);
  assert.equal(result.hasDoctolib, true);
  assert.equal(result.doctolibUrl, "https://www.doctolib.fr/neurologue/lille/olivier-hoornaert");
  assert.equal(calculateDigitalAvailabilityScore(result), 3.5);
});

test("detects mail and SMS alternatives", () => {
  const result = extractDigitalAccessFromTexts([
    "La prise de rendez-vous peut être faite de la façon suivante : mail (test@example.fr), SMS (0612345678).",
  ]);

  assert.equal(result.hasOnlineBooking, false);
  assert.deepEqual(result.bookingMethods, ["mail", "sms"]);
  assert.equal(calculateDigitalAvailabilityScore(result), 0.5);
});

test("detects phone-only booking without digital availability score", () => {
  const result = extractDigitalAccessFromTexts([
    "La prise de rendez-vous ne peut être faite que par téléphone.",
  ]);

  assert.equal(result.hasOnlineBooking, false);
  assert.deepEqual(result.bookingMethods, ["phone"]);
  assert.equal(calculateDigitalAvailabilityScore(result), 0);
});

test("keeps empty text neutral", () => {
  const result = extractDigitalAccessFromTexts([""]);

  assert.equal(result.hasOnlineBooking, false);
  assert.equal(result.hasDoctolib, false);
  assert.equal(result.hasWebsite, false);
  assert.deepEqual(result.bookingMethods, []);
  assert.equal(calculateDigitalAvailabilityScore(result), 0);
});

test("merges practitioner-location signals by healthcare location", () => {
  const merged = mergeDigitalAccessSignals([
    extractDigitalAccessFromTexts(["site internet (Doctolib)."]),
    extractDigitalAccessFromTexts(["mail (secretariat@example.fr), SMS (0600000000)."]),
  ]);

  assert.equal(merged.hasOnlineBooking, true);
  assert.equal(merged.hasDoctolib, true);
  assert.deepEqual(merged.bookingMethods, ["online_booking", "doctolib", "mail", "sms"]);
  assert.equal(calculateDigitalAvailabilityScore(merged), 3);
});
