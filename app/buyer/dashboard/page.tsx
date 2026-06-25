"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, TrendingUp, Star } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { ListingCard } from "@/components/market/listing-card";
import { ListingCardSkeleton } from "@/components/market/listing-card-skeleton";
import type { ListingWithFarmer } from "@/lib/types";

export default function BuyerDashboard() {
  const [totalListings, setTotalListings] = useState(0);
  const [featuredListings, setFeaturedListings] = useState<ListingWithFarmer[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setTotalListings(data.listings?.length || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/listings?sort=newest&limit=6")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedListings(data.listings || []);
        setFeaturedLoading(false);
      })
      .catch(() => setFeaturedLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold">Welcome to the Marketplace</h1>
          <p className="text-muted-foreground">Browse fresh crops from local farmers</p>
        </section>

        <section className="grid grid-cols-3 gap-4">
          <Link
            href="/buyer/market"
            className="p-4 rounded-xl bg-primary/10 text-center hover:bg-primary/20 transition-colors"
          >
            <Store className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-bold">Browse</p>
            <p className="text-xs text-muted-foreground">All Listings</p>
          </Link>
          <div className="p-4 rounded-xl bg-accent/10 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
            <p className="font-bold">{totalListings}</p>
            <p className="text-xs text-muted-foreground">Available Listings</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/10 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
            <p className="font-bold">4.9</p>
            <p className="text-xs text-muted-foreground">Your Rating</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Featured Listings</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))
            ) : featuredListings.length > 0 ? (
              featuredListings.map((listing: ListingWithFarmer) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  crop={listing.crop}
                  quantity={listing.quantity}
                  price={listing.price}
                  grade={listing.grade}
                  municipality={listing.municipality}
                  farmerName={listing.farmer?.full_name}
                  photos={listing.photos}
                  href={`/buyer/market/${listing.id}`}
                />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">
                <Link href="/buyer/market" className="text-primary hover:underline">
                  Browse the market
                </Link>{" "}
                to see available crops
              </p>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
