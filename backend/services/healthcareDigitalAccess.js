const URL_PATTERN = /https?:\/\/[^\s),;"']+/gi;

function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function stripTrailingUrlPunctuation(url) {
  return url.replace(/[.,;:!?]+$/g, "");
}

function extractUrls(text) {
  return unique((text.match(URL_PATTERN) || []).map(stripTrailingUrlPunctuation));
}

function hasPattern(text, pattern) {
  return pattern.test(text);
}

function getUrlHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function deriveConfidence({ hasOnlineBooking, hasDoctolib, doctolibUrl, hasWebsite, websiteUrl, hasTeleconsultation, bookingMethods }) {
  if (doctolibUrl || websiteUrl) return 0.95;
  if (hasDoctolib || hasOnlineBooking) return 0.85;
  if (hasWebsite || hasTeleconsultation) return 0.75;
  if (bookingMethods.length > 0) return 0.65;
  return 0;
}

export function extractDigitalAccessFromTexts(texts) {
  const text = compactText(texts.filter(Boolean).join(" "));
  const lowerText = text.toLocaleLowerCase("fr-FR");
  const urls = extractUrls(text);
  const doctolibUrl = urls.find((url) => /(^|\.)doctolib\.fr/i.test(getUrlHostname(url)));
  const websiteUrl = urls.find((url) => !/(^|\.)doctolib\.fr/i.test(getUrlHostname(url)));
  const mentionsDoctolib = lowerText.includes("doctolib");
  const mentionsSiteInternet = hasPattern(lowerText, /site internet/);
  const mentionsOnlineBooking = hasPattern(
    lowerText,
    /(prise de rendez-vous|rendez-vous|rdv)[^.]{0,160}(site internet|doctolib|en ligne|internet)/
  );
  const siteInternetIsOnlyDoctolib = hasPattern(
    lowerText,
    /site internet\s*\([^)]*doctolib[^)]*\)/
  ) && !websiteUrl;
  const hasOnlineBooking = mentionsOnlineBooking || mentionsDoctolib;
  const hasDoctolib = mentionsDoctolib || Boolean(doctolibUrl);
  const hasWebsite = Boolean(websiteUrl) || (mentionsSiteInternet && !siteInternetIsOnlyDoctolib && !hasDoctolib);
  const hasTeleconsultation = hasPattern(
    lowerText,
    /t[ée]l[ée](consultation|m[ée]decine)|tele(consultation|medecine)/
  );

  const bookingMethods = [];
  if (hasOnlineBooking) bookingMethods.push("online_booking");
  if (hasDoctolib) bookingMethods.push("doctolib");
  if (hasPattern(lowerText, /\b(mail|email|e-mail|courriel)\b/)) bookingMethods.push("mail");
  if (hasPattern(lowerText, /\bsms\b/)) bookingMethods.push("sms");
  if (hasPattern(lowerText, /t[ée]l[ée]phone|par téléphone|telephone/)) bookingMethods.push("phone");

  const normalizedBookingMethods = unique(bookingMethods);

  return {
    hasOnlineBooking,
    hasDoctolib,
    doctolibUrl: doctolibUrl || null,
    hasWebsite,
    websiteUrl: websiteUrl || null,
    hasTeleconsultation,
    bookingMethods: normalizedBookingMethods,
    websiteAccessibilityStatus: "unknown",
    doctolibAccessibilityStatus: "unknown",
    confidence: deriveConfidence({
      hasOnlineBooking,
      hasDoctolib,
      doctolibUrl,
      hasWebsite,
      websiteUrl,
      hasTeleconsultation,
      bookingMethods: normalizedBookingMethods,
    }),
    source: "parsed_sante_fr_text",
  };
}

export function mergeDigitalAccessSignals(signals) {
  const firstDoctolibUrl = signals.find((signal) => signal.doctolibUrl)?.doctolibUrl || null;
  const firstWebsiteUrl = signals.find((signal) => signal.websiteUrl)?.websiteUrl || null;
  const bookingMethods = unique(signals.flatMap((signal) => signal.bookingMethods));

  return {
    hasOnlineBooking: signals.some((signal) => signal.hasOnlineBooking),
    hasDoctolib: signals.some((signal) => signal.hasDoctolib),
    doctolibUrl: firstDoctolibUrl,
    hasWebsite: signals.some((signal) => signal.hasWebsite),
    websiteUrl: firstWebsiteUrl,
    hasTeleconsultation: signals.some((signal) => signal.hasTeleconsultation),
    bookingMethods,
    websiteAccessibilityStatus: "unknown",
    doctolibAccessibilityStatus: "unknown",
    confidence: Math.max(0, ...signals.map((signal) => Number(signal.confidence || 0))),
    source: "parsed_sante_fr_text",
  };
}

export function calculateDigitalAvailabilityScore(digitalAccess) {
  if (!digitalAccess) return 0;

  const bookingMethods = digitalAccess.bookingMethods || digitalAccess.booking_methods || [];
  const hasAlternativeDigitalContact =
    bookingMethods.includes("mail") || bookingMethods.includes("sms");
  const hasKnownUrl = Boolean(
    digitalAccess.doctolibUrl ||
      digitalAccess.doctolib_url ||
      digitalAccess.websiteUrl ||
      digitalAccess.website_url
  );

  const score =
    (digitalAccess.hasOnlineBooking || digitalAccess.has_online_booking ? 1.5 : 0) +
    (digitalAccess.hasDoctolib || digitalAccess.has_doctolib ? 1 : 0) +
    (hasKnownUrl ? 1 : 0) +
    (digitalAccess.hasTeleconsultation || digitalAccess.has_teleconsultation ? 1 : 0) +
    (hasAlternativeDigitalContact ? 0.5 : 0);

  return Math.round(Math.min(5, score) * 10) / 10;
}
