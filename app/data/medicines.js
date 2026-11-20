const bangladeshMedicineCompanies = [
  "Square Pharmaceuticals Ltd.",
  "Incepta Pharmaceuticals Ltd.",
  "Beximco Pharmaceuticals Ltd.",
  "Renata PLC",
  "The ACME Laboratories Ltd.",
  "ACI Pharmaceuticals",
  "Aristopharma Ltd.",
  "Opsonin Pharma Ltd.",
  "Healthcare Pharmaceuticals Ltd.",
  "Eskayef Pharmaceuticals Ltd. (SK+F)",
  "Popular Pharmaceuticals Ltd.",
  "Drug International Ltd.",
  "Ibn Sina Pharmaceutical Industry Ltd.",
  "Beacon Pharmaceuticals PLC",
  "Orion Pharma Ltd.",
  "Radiant Pharmaceuticals Ltd.",
  "General Pharmaceuticals Ltd.",
  "Nuvista Pharma Ltd.",
  "Sanofi Bangladesh Ltd.",
  "Novartis (Bangladesh) Ltd.",
  "GlaxoSmithKline (GSK) Bangladesh",
  "Roche Bangladesh Ltd.",
  "Servier Bangladesh Operations",
  "Novo Nordisk Pharma (Pvt.) Ltd.",
  "Ziska Pharmaceuticals Ltd.",
  "Kemiko Pharmaceuticals Ltd.",
  "Silva Pharmaceuticals Ltd.",
  "Albion Laboratories Ltd.",
  "Amico Laboratories Ltd.",
  "Astra Biopharmaceuticals Ltd.",
  "Benham Pharmaceuticals Ltd.",
  "Biopharma Ltd.",
  "Bristol Pharma Bangladesh Ltd.",
  "Central Pharmaceutical Ltd.",
  "Chemist Laboratories Ltd.",
  "Cosmic Pharma Ltd.",
  "Decent Pharma Laboratories Ltd.",
  "Delta Pharma Ltd.",
  "Edruc Ltd.",
  "Eon Pharmaceuticals Ltd.",
  "Everest Pharmaceuticals Ltd.",
  "Fisons Bangladesh Ltd.",
  "Gaco Pharmaceuticals Ltd.",
  "Globe Pharmaceuticals Ltd.",
  "Gonoshasthaya Antibiotic Ltd.",
  "Guardian Healthcare Ltd.",
  "Hudson Pharmaceuticals Ltd.",
  "Jayson Pharmaceuticals Ltd.",
  "Labaid Pharmaceuticals Ltd.",
  "Libra Pharmaceuticals Ltd."
];

export const CUSTOM_COMPANIES_STORAGE_KEY = "sheikhDrugsCustomCompanies";
export const DELETED_COMPANIES_STORAGE_KEY = "sheikhDrugsDeletedCompanies";

export const CompanyList = Array.from(
  new Set(
    bangladeshMedicineCompanies
      .map((name) => String(name || "").trim())
      .filter(Boolean)
  )
);

// SSR & First Client render hydration-safe helper:
// Passes customList & deletedList explicitly from client state after mount.
export function getSyncedCompanies(
  baseList = CompanyList,
  medicinesData = [],
  customList = [],
  deletedList = []
) {
  const deletedSet = new Set(
    (Array.isArray(deletedList) ? deletedList : [])
      .map((c) => String(c || "").trim().toLowerCase())
      .filter(Boolean)
  );

  const dbCompanies = Array.isArray(medicinesData)
    ? medicinesData
        .map((m) => String(m?.company || "").trim())
        .filter(Boolean)
    : [];

  const merged = [
    ...(Array.isArray(customList) ? customList : []),
    ...(Array.isArray(baseList) ? baseList : []),
    ...dbCompanies,
  ];

  const seen = new Set();
  const result = [];

  for (const comp of merged) {
    const clean = String(comp || "").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (deletedSet.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }

  return result;
}

export function broadcastCompaniesUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("companiesUpdated"));
  }
}

// Helper to normalize alternative brands for frontend display
export function getAlternativeBrands(medicine) {
  if (
    Array.isArray(medicine?.alternativeBrands) &&
    medicine.alternativeBrands.length > 0
  ) {
    return medicine.alternativeBrands
      .map((item) => ({
        name: String(item?.name || "").trim(),
        company: String(item?.company || "").trim(),
      }))
      .filter((item) => item.name || item.company);
  }

  if (
    typeof medicine?.alternativeBrand === "string" &&
    medicine.alternativeBrand.trim()
  ) {
    return [
      {
        name: medicine.alternativeBrand.trim(),
        company: "",
      },
    ];
  }

  return [];
}

// ডাটাবেস থেকে লাইভ ডেটা লোড হওয়ায় initialMedicines খালি রাখা হয়েছে,
// যাতে অ্যাডমিন থেকে ডিলিট করলে পুরনো স্ট্যাটিক আইটেম আর ফ্রন্টএন্ডে না দেখায়।
export const initialMedicines = [];

// Helper to get all medicines
export function getMedicines() {
  return initialMedicines;
}