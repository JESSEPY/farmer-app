"use client";

import { useEffect, useState } from "react";
import { MapPin, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Municipality {
  name: string;
  lat: number;
  lng: number;
  availability: "high" | "medium" | "low";
  count: number;
}

const masbateMunicipalities: Municipality[] = [
  { name: "Mobo", lat: 12.35, lng: 123.63, availability: "high", count: 12 },
  { name: "Milagros", lat: 12.23, lng: 123.51, availability: "high", count: 8 },
  { name: "Aroroy", lat: 12.51, lng: 123.40, availability: "medium", count: 5 },
  { name: "Baleno", lat: 12.46, lng: 123.50, availability: "medium", count: 4 },
  { name: "Balud", lat: 11.82, lng: 123.60, availability: "low", count: 3 },
  { name: "Cawayan", lat: 11.85, lng: 123.68, availability: "low", count: 2 },
  { name: "Claveria", lat: 12.15, lng: 123.25, availability: "medium", count: 6 },
  { name: "Dapa", lat: 11.55, lng: 123.95, availability: "low", count: 1 },
  { name: "Esperanza", lat: 11.78, lng: 124.02, availability: "low", count: 2 },
  { name: "Mandaon", lat: 12.02, lng: 123.35, availability: "medium", count: 4 },
  { name: "Pilar", lat: 11.68, lng: 123.73, availability: "medium", count: 5 },
  { name: "San Fernando", lat: 11.98, lng: 123.98, availability: "low", count: 2 },
  { name: "San Jose", lat: 11.62, lng: 123.98, availability: "low", count: 1 },
  { name: "Uson", lat: 12.25, lng: 123.73, availability: "medium", count: 4 },
];

export function MarketMap() {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<any>;
    TileLayer: React.ComponentType<any>;
    Marker: React.ComponentType<any>;
    Popup: React.ComponentType<any>;
  } | null>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      import("leaflet").then((leaflet) => {
        // Fix marker icons
        delete (leaflet.default as any).Icon.Default.prototype._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        setMapComponents({
          MapContainer: mod.MapContainer,
          TileLayer: mod.TileLayer,
          Marker: mod.Marker,
          Popup: mod.Popup,
        });
      });
    });
  }, []);

  const getMarkerColor = (availability: "high" | "medium" | "low") => {
    switch (availability) {
      case "high": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-gray-400";
    }
  };

  if (!MapComponents) {
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

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <Card>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        <div className="h-[400px] relative">
          <MapContainer
            center={[12.15, 123.65]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {masbateMunicipalities.map((mun) => (
              <Marker key={mun.name} position={[mun.lat, mun.lng]}>
                <Popup>
                  <div className="p-2 min-w-[120px]">
                    <p className="font-semibold">{mun.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Leaf className={cn("w-3 h-3", getMarkerColor(mun.availability))} />
                      <span className={cn(
                        "text-xs",
                        mun.availability === "high" && "text-green-600",
                        mun.availability === "medium" && "text-yellow-600",
                        mun.availability === "low" && "text-gray-500"
                      )}>
                        {mun.availability.charAt(0).toUpperCase() + mun.availability.slice(1)} Availability
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{mun.count} listings</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">High Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Medium Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm">Low Availability</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}