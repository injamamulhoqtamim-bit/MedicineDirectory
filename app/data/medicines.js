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

export const CompanyList = Array.from(
  new Set(
    bangladeshMedicineCompanies
      .map((name) => String(name || "").trim())
      .filter(Boolean)
  )
);

// ডাটাবেস থেকে লাইভ ডেটা লোড হওয়ায় initialMedicines খালি রাখা হয়েছে,
// যাতে অ্যাডমিন থেকে ডিলিট করলে পুরনো স্ট্যাটিক আইটেম আর ফ্রন্টএন্ডে না দেখায়।
export const initialMedicines = [];

// Helper to get all medicines
export function getMedicines() {
  return initialMedicines;
}