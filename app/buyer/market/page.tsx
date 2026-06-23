"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Grid, Map, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContainer } from "@/components/layout/page-container";
import { MarketMap } from "@/components/market/market-map";
import { ListingCard } from "@/components/market/listing-card";
import { ListingCardSkeleton } from "@/components/market/listing-card-skeleton";
import { cropTypes, municipalities, sortOptions } from "@/lib/constants/market";

export default function BuyerMarketPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [municipalityFilter, setMunicipalityFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (cropFilter !== "all") params.set("crop", cropFilter);
      if (municipalityFilter !== "all") params.set("municipality", municipalityFilter);
      if (sort !== "newest") params.set("sort", sort);
      const res = await fetch(`/api/listings?${params}`);
      if (!res.ok) { setError(true); setLoading(false); return; }
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, cropFilter, municipalityFilter, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const hasActiveFilters = cropFilter !== "all" || municipalityFilter !== "all" || sort !== "newest";

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Market</h1>
          <p className="text-muted-foreground">Browse agricultural products from local farmers</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search crops..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={cropFilter} onValueChange={(v) => v && setCropFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Crops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {cropTypes.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={municipalityFilter} onValueChange={(v) => v && setMunicipalityFilter(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Municipalities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {municipalities.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => v && setSort(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <button
                onClick={() => { setCropFilter("all"); setMunicipalityFilter("all"); setSort("newest"); }}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list" className="cursor-pointer">
              <Grid className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="cursor-pointer">
              <Map className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-2">Failed to load listings</p>
                <button onClick={fetchListings} className="text-primary hover:underline text-sm cursor-pointer">
                  Try again
                </button>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-sm mx-auto space-y-3">
                  <p className="text-muted-foreground">
                    {hasActiveFilters
                      ? "No listings match your filters"
                      : "No listings available yet"}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={() => { setCropFilter("all"); setMunicipalityFilter("all"); setSort("newest"); setSearch(""); }}
                      className="text-primary hover:underline text-sm cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Listings will appear here once farmers start posting their produce. Check back soon!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  {listings.length} {listings.length === 1 ? "listing" : "listings"} found
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((item: any) => (
                    <ListingCard
                      key={item.id}
                      id={item.id}
                      crop={item.crop}
                      quantity={item.quantity}
                      price={item.price}
                      grade={item.grade}
                      municipality={item.municipality}
                      farmerName={item.farmer?.full_name}
                      photos={item.photos || []}
                      href={`/buyer/market/${item.id}`}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Masbate Commodity Map</h3>
                <p className="text-muted-foreground text-sm">Interactive map showing commodity distribution across municipalities</p>
              </div>
              <MarketMap />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
