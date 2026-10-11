import { MUNICIPALITY_COORDS } from "@/lib/constants/market";

// Masbate's PSGC province code (Philippine Standard Geographic Code).
const MASBATE_PSGC = "054100000";
const PSGC_BASE = "https://psgc.gitlab.io/api";

interface PsgcPlace {
  name: string;
}

const CANONICAL = new Map(Object.keys(MUNICIPALITY_COORDS).map((n) => [n.toLowerCase(), n]));

// PSGC says "City of Masbate" and "Pio v. Corpuz"; the app uses "Masbate City" and "Pio V. Corpuz".
function normalizeName(raw: string): string {
  const name = raw.trim().replace(/^City of (.+)$/i, "$1 City");
  return CANONICAL.get(name.toLowerCase()) ?? name;
}

async function fetchPlaces(kind: "municipalities" | "cities"): Promise<PsgcPlace[]> {
  const res = await fetch(`${PSGC_BASE}/provinces/${MASBATE_PSGC}/${kind}/`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error(`PSGC ${kind} request failed: ${res.status}`);
  return res.json();
}

export async function getMasbateMunicipalities(): Promise<{ names: string[]; source: "psgc" | "fallback" }> {
  try {
    const [municipalities, cities] = await Promise.all([fetchPlaces("municipalities"), fetchPlaces("cities")]);
    const names = [...municipalities, ...cities].map((p) => normalizeName(p.name));
    if (names.length === 0) throw new Error("PSGC returned no places");
    return { names: [...new Set(names)].sort((a, b) => a.localeCompare(b)), source: "psgc" };
  } catch (err) {
    console.error("Municipality lookup failed, using fallback:", err);
    return { names: Object.keys(MUNICIPALITY_COORDS).sort((a, b) => a.localeCompare(b)), source: "fallback" };
  }
}
