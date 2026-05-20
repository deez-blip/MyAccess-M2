async function fetchCenters() {
  const res = await fetch("http://localhost:3001/api/centers?limit=500");
  return res.json();
}

function passesFilter(center, selectedHandicaps, minScore = 2.5) {
  if (!selectedHandicaps || selectedHandicaps.length === 0) return true;

  return selectedHandicaps.every((handicap) => {
    const profileKeys =
      handicap === "vision" ? ["low_vision", "blind"] : [handicap];
    return profileKeys.some(
      (key) => (center.accessibilityProfiles?.[key]?.score || 0) >= minScore,
    );
  });
}

(async () => {
  try {
    const centers = await fetchCenters();
    const tests = ["wheelchair", "vision", "obesity", "hearing"];
    for (const t of tests) {
      const matched = centers.filter((c) => passesFilter(c, [t]));
      console.log(t, matched.length);
    }
  } catch (err) {
    console.error("Error", err);
  }
})();
