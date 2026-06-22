"use client";

import { useState, useEffect } from "react";
import { Search, Grid, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/page-container";
import { MarketMap } from "@/components/market/market-map";
import { ListingCard } from "@/components/market/listing-card";

export default function BuyerMarketPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/listings?${params}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Market</h1>
          <p className="text-muted-foreground">Browse agricultural products from local farmers</p>
        </div>

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
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No listings available yet</p>
              </div>
            ) : (
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
