"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toCsv } from "@/lib/admin/csv";
import { combineDatasets } from "@/lib/admin/combine";

type Cell = string | number | null;
interface Dataset {
  headers: string[];
  rows: Cell[][];
}

const TABS = [
  { type: "farmers", label: "Farmers" },
  { type: "plantings", label: "Plantings" },
  { type: "harvests", label: "Harvests" },
  { type: "listings", label: "Listings" },
] as const;
type TabType = (typeof TABS)[number]["type"];

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T/;
const display = (v: Cell) =>
  v === null || v === "" ? "—" : typeof v === "string" && ISO_TIMESTAMP.test(v) ? new Date(v).toLocaleDateString() : String(v);

// Column 0 is the farmer's name and column 1 their phone in every dataset.
const farmerKey = (r: Cell[]) => `${r[0] ?? "(no name)"}|${r[1] ?? ""}`;
const farmerLabel = (r: Cell[]) => `${r[0] ?? "(no name)"}${r[1] ? ` · ${r[1]}` : ""}`;

export default function AdminPage() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<TabType>("farmers");
  const [data, setData] = useState<Partial<Record<TabType, Dataset>>>({});
  const [loading, setLoading] = useState<TabType | null>("farmers");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [farmer, setFarmer] = useState("");
  const [exportingAll, setExportingAll] = useState(false);

  useEffect(() => {
    if (data[tab]) return;
    let cancelled = false;
    fetch(`/api/admin/data?type=${tab}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Failed to load data");
        if (!cancelled) {
          setData((d) => ({ ...d, [tab]: body }));
          setError(null);
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(null));
    return () => {
      cancelled = true;
    };
  }, [tab, data]);

  const switchTab = (next: TabType) => {
    setTab(next);
    setError(null);
    setLoading(data[next] ? null : next);
  };

  const dataset = data[tab];

  // Farmer options come from the farmers list when loaded, otherwise the current tab.
  const farmerOptions = useMemo(() => {
    const source = data.farmers?.rows ?? dataset?.rows ?? [];
    const seen = new Map<string, string>();
    source.forEach((r) => seen.set(farmerKey(r), farmerLabel(r)));
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data.farmers, dataset]);

  const rows = useMemo(() => {
    if (!dataset) return [];
    const q = query.trim().toLowerCase();
    return dataset.rows.filter(
      (r) =>
        (!farmer || farmerKey(r) === farmer) &&
        (!q || r.some((c) => c !== null && String(c).toLowerCase().includes(q)))
    );
  }, [dataset, query, farmer]);

  const today = () => new Date().toISOString().slice(0, 10);

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    if (!dataset) return;
    download(
      new Blob([toCsv(dataset.headers, rows)], { type: "text/csv;charset=utf-8" }),
      `kita-ani-${tab}-${today()}.csv`
    );
  };

  // Every farmer and all of their data in a single CSV. Ignores the filters.
  const exportAll = async () => {
    setExportingAll(true);
    setError(null);
    try {
      const all: Record<string, Dataset> = {};
      for (const t of TABS) {
        let ds = data[t.type];
        if (!ds) {
          const res = await fetch(`/api/admin/data?type=${t.type}`);
          const body = await res.json();
          if (!res.ok) throw new Error(body.error || `Failed to load ${t.label}`);
          ds = body as Dataset;
          setData((d) => ({ ...d, [t.type]: ds }));
        }
        all[t.type] = ds;
      }
      const combined = combineDatasets(all);
      download(
        new Blob([toCsv(combined.headers, combined.rows)], { type: "text/csv;charset=utf-8" }),
        `kita-ani-all-data-${today()}.csv`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex gap-2">
          <Button className="cursor-pointer min-h-[44px]" onClick={exportAll} disabled={exportingAll}>
            <Download className="size-4 mr-2" />
            {exportingAll ? "Preparing..." : "Export all data"}
          </Button>
          <Button variant="outline" className="cursor-pointer min-h-[44px]" onClick={() => signOut()}>
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap gap-2" role="tablist">
            {TABS.map((t) => (
              <Button
                key={t.type}
                role="tab"
                aria-selected={tab === t.type}
                variant={tab === t.type ? "default" : "outline"}
                className="cursor-pointer min-h-[44px]"
                onClick={() => switchTab(t.type)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search this table"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search this table"
            />
            <select
              value={farmer}
              onChange={(e) => setFarmer(e.target.value)}
              aria-label="Filter by farmer"
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm sm:w-64"
            >
              <option value="">All farmers</option>
              {farmerOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              className="cursor-pointer min-h-[44px] sm:min-h-8 shrink-0"
              onClick={exportCsv}
              disabled={!dataset || rows.length === 0}
            >
              <Download className="size-4 mr-2" /> Export CSV ({rows.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading === tab && !dataset && <p className="text-sm text-muted-foreground">Loading...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {dataset && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    {dataset.headers.map((h) => (
                      <th key={h} className="py-2 pr-4 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0 align-top">
                      {r.map((c, j) => (
                        <td key={j} className="py-2 pr-4 max-w-64 truncate" title={c === null ? "" : String(c)}>
                          {display(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={dataset.headers.length} className="py-6 text-center text-muted-foreground">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
