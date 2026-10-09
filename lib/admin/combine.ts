type Cell = string | number | null;
export interface Dataset {
  headers: string[];
  rows: Cell[][];
}

const SECTIONS: { type: string; label: string }[] = [
  { type: "farmers", label: "Farmer" },
  { type: "plantings", label: "Planting" },
  { type: "harvests", label: "Harvest" },
  { type: "listings", label: "Listing" },
];

// Merge every dataset into one long table: Farmer, Phone, Record type, then the
// columns of each record type side by side (prefixed, e.g. "Harvest: Yield").
// Each row fills only its own type's columns. Sorted by farmer, then record type.
export function combineDatasets(datasets: Record<string, Dataset>): Dataset {
  const present = SECTIONS.filter((s) => datasets[s.type]);
  const headers = ["Farmer", "Phone", "Record type"];
  const offsets = new Map<string, number>();
  for (const s of present) {
    offsets.set(s.type, headers.length);
    headers.push(...datasets[s.type].headers.slice(2).map((h) => `${s.label}: ${h}`));
  }

  const out: { sort: string; order: number; row: Cell[] }[] = [];
  present.forEach((s, order) => {
    const start = offsets.get(s.type)!;
    for (const r of datasets[s.type].rows) {
      const row: Cell[] = new Array(headers.length).fill(null);
      row[0] = r[0];
      row[1] = r[1];
      row[2] = s.label;
      r.slice(2).forEach((c, i) => (row[start + i] = c));
      out.push({ sort: `${r[0] ?? ""}|${r[1] ?? ""}`.toLowerCase(), order, row });
    }
  });
  out.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : a.order - b.order));
  return { headers, rows: out.map((o) => o.row) };
}
