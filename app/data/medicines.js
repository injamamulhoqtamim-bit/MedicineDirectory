export const CUSTOM_COMPANIES_STORAGE_KEY = "sheikhDrugsCustomCompanies";
export const DELETED_COMPANIES_STORAGE_KEY = "sheikhDrugsDeletedCompanies";

// শুরুতে কোনো হার্ডকোডেড ৫০টি কোম্পানি থাকবে না
export const CompanyList = [];

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

  // শুধুমাত্র অ্যাডমিন থেকে যুক্ত করা কোম্পানি ও ডাটাবেসের ওষুধের কোম্পানি নেওয়া হবে
  const merged = [
    ...(Array.isArray(customList) ? customList : []),
    ...dbCompanies,
    ...(Array.isArray(baseList) ? baseList : []),
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

export const initialMedicines = [];

export function getMedicines() {
  return initialMedicines;
}