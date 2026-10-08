"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import type { DivIcon } from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { MASBATE_MUNICIPALITIES } from "@/lib/constants/market";
import { DEMO_SUPPLY } from "@/lib/mock/market-demo";

type Availability = "high" | "medium" | "low" | "none";

interface SupplyEntry {
  municipality: string;
  crop: string;
  quantityKg: number;
  pricePerKg: number;
  demo: boolean;
}

interface ApiListing {
  crop: string;
  quantity: string;
  price: number | string;
  municipality: string;
}

interface CropTotal {
  crop: string;
  kg: number;
  minPrice: number;
  maxPrice: number;
}

interface MunicipalitySupply {
  name: string;
  lat: number;
  lng: number;
  count: number;
  totalKg: number;
  hasDemo: boolean;
  crops: CropTotal[];
  availability: Availability;
}

// Total kilograms available in a municipality -> how full the pin looks.
function getAvailability(totalKg: number): Availability {
  if (totalKg >= 1500) return "high";
  if (totalKg >= 500) return "medium";
  if (totalKg > 0) return "low";
  return "none";
}

const PIN_COLORS: Record<Availability, string> = {
  high: "#16a34a",
  medium: "#f59e0b",
  low: "#64748b",
  none: "#cbd5e1",
};

const AVAILABILITY_LABEL: Record<Availability, string> = {
  high: "High availability",
  medium: "Medium availability",
  low: "Low availability",
  none: "No listings yet",
};

const formatKg = (kg: number) => `${Math.round(kg).toLocaleString("en-PH")} kg`;
const formatPrice = (n: number) => `₱${Number.isInteger(n) ? n : n.toFixed(2)}`;

function createPinIcon(L: typeof import("leaflet"), supply: MunicipalitySupply): DivIcon {
  const color = PIN_COLORS[supply.availability];
  if (supply.availability === "none") {
    return L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -9],
    });
  }

  // Teardrop pin with the listing count inside.
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:34px;height:34px">
      <div style="position:absolute;inset:0;background:${color};border:2px solid #fff;border-radius:9999px 9999px 9999px 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>
      <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;line-height:1">${supply.count}</span>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

export function MarketMap() {
  const [realEntries, setRealEntries] = useState<SupplyEntry[]>([]);
  const [showDemo, setShowDemo] = useState(true);
  const [leaflet, setLeaflet] = useState<{
    L: typeof import("leaflet");
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        const entries: SupplyEntry[] = ((data.listings || []) as ApiListing[]).map((l) => ({
          municipality: l.municipality,
          crop: l.crop,
          quantityKg: parseFloat(l.quantity) || 0,
          pricePerKg: Number(l.price) || 0,
          demo: false,
        }));
        setRealEntries(entries);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, leafletModule]) => {
      setLeaflet({
        L: leafletModule.default,
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
      });
    });
  }, []);

  const entries = useMemo<SupplyEntry[]>(
    () => [...realEntries, ...(showDemo ? DEMO_SUPPLY.map((d) => ({ ...d, demo: true })) : [])],
    [realEntries, showDemo]
  );

  const supplies = useMemo<MunicipalitySupply[]>(() => {
    return MASBATE_MUNICIPALITIES.map((m) => {
      const here = entries.filter((e) => e.municipality === m.name);
      const byCrop = new Map<string, CropTotal>();
      for (const e of here) {
        const existing = byCrop.get(e.crop);
        if (existing) {
          existing.kg += e.quantityKg;
          existing.minPrice = Math.min(existing.minPrice, e.pricePerKg);
          existing.maxPrice = Math.max(existing.maxPrice, e.pricePerKg);
        } else {
          byCrop.set(e.crop, { crop: e.crop, kg: e.quantityKg, minPrice: e.pricePerKg, maxPrice: e.pricePerKg });
        }
      }
      const totalKg = here.reduce((sum, e) => sum + e.quantityKg, 0);
      return {
        ...m,
        count: here.length,
        totalKg,
        hasDemo: here.some((e) => e.demo),
        crops: Array.from(byCrop.values()).sort((a, b) => b.kg - a.kg),
        availability: getAvailability(totalKg),
      };
    });
  }, [entries]);

  const unmappedCount = useMemo(() => {
    const known = new Set(MASBATE_MUNICIPALITIES.map((m) => m.name));
    return realEntries.filter((e) => !known.has(e.municipality)).length;
  }, [realEntries]);

  const totals = useMemo(() => {
    const active = supplies.filter((s) => s.count > 0);
    return {
      listings: active.reduce((sum, s) => sum + s.count, 0),
      kg: active.reduce((sum, s) => sum + s.totalKg, 0),
      areas: active.length,
    };
  }, [supplies]);

  if (!leaflet) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Popup } = leaflet;

  return (
    <Card>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{totals.listings}</span> listings ·{" "}
            <span className="font-medium text-foreground">{formatKg(totals.kg)}</span> across{" "}
            <span className="font-medium text-foreground">{totals.areas}</span> of {MASBATE_MUNICIPALITIES.length}{" "}
            municipalities
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDemo}
              onChange={(e) => setShowDemo(e.target.checked)}
              className="h-4 w-4 accent-green-600"
            />
            Include sample data
          </label>
        </div>

        <div className="h-[520px] relative">
          <MapContainer
            center={[12.35, 123.65]}
            zoom={9}
            minZoom={8}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {supplies.map((s) => (
              <Marker
                key={s.name}
                position={[s.lat, s.lng]}
                icon={createPinIcon(L, s)}
                zIndexOffset={s.availability === "none" ? 0 : Math.round(s.totalKg / 10)}
              >
                <Popup>
                  <div className="min-w-[190px] text-sm">
                    <p className="font-semibold text-base leading-tight">{s.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: PIN_COLORS[s.availability] }}
                      />
                      {AVAILABILITY_LABEL[s.availability]}
                    </p>

                    {s.count > 0 ? (
                      <>
                        <p className="mt-2 text-xs text-gray-600">
                          {s.count} {s.count === 1 ? "listing" : "listings"} · {formatKg(s.totalKg)}
                        </p>
                        <ul className="mt-1 space-y-0.5 border-t border-gray-200 pt-1.5">
                          {s.crops.slice(0, 4).map((c) => (
                            <li key={c.crop} className="flex justify-between gap-3 text-xs">
                              <span>{c.crop}</span>
                              <span className="whitespace-nowrap text-gray-600">
                                {formatKg(c.kg)} ·{" "}
                                {c.minPrice === c.maxPrice
                                  ? `${formatPrice(c.minPrice)}/kg`
                                  : `${formatPrice(c.minPrice)}–${formatPrice(c.maxPrice)}/kg`}
                              </span>
                            </li>
                          ))}
                          {s.crops.length > 4 && (
                            <li className="text-xs text-gray-500">+ {s.crops.length - 4} more</li>
                          )}
                        </ul>
                        {s.hasDemo && <p className="mt-1.5 text-[11px] italic text-amber-700">Includes sample data</p>}
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-gray-600">Nothing for sale here right now.</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
            {(["high", "medium", "low", "none"] as Availability[]).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: PIN_COLORS[level] }} />
                <span className="text-sm">
                  {level === "high" && "High (1,500+ kg)"}
                  {level === "medium" && "Medium (500+ kg)"}
                  {level === "low" && "Low (under 500 kg)"}
                  {level === "none" && "No listings"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            The number on each pin is how many listings are in that municipality. Click a pin for details.
            {unmappedCount > 0 && ` ${unmappedCount} listing${unmappedCount === 1 ? " is" : "s are"} in areas not shown on the map.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
