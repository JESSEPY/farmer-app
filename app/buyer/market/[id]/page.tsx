"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { ArrowLeft, MapPin, Store, Phone, MessageCircle, ShieldCheck, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageContainer } from "@/components/layout/page-container";
import { ImageGallery } from "@/components/market/image-gallery";
import { cn } from "@/lib/utils";

interface ListingDetailProps {
  params: Promise<{ id: string }>;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function ListingDetailPage({ params }: ListingDetailProps) {
  const { id } = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setListing(data.listing);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-7 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-32" />
            </div>
            <div className="h-5 bg-muted rounded w-16" />
          </div>
          <div className="h-48 sm:h-64 rounded-lg bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-28 rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
          </div>
          <div className="h-36 rounded-xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 rounded-md bg-muted" />
            <div className="h-10 rounded-md bg-muted" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!listing) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto space-y-3">
            <p className="text-muted-foreground">This listing could not be found</p>
            <p className="text-xs text-muted-foreground">It may have been archived or removed by the seller.</p>
            <Link href="/buyer/market" className="text-primary hover:underline text-sm inline-block">Back to market</Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/buyer/market"
            aria-label="Back to market"
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{listing.crop}</h1>
            <p className="text-muted-foreground">Posted {new Date(listing.created_at).toLocaleDateString()}</p>
          </div>
          <Badge variant="secondary" className={cn("text-xs", gradeColors[listing.grade] || gradeColors.A)}>
            Grade {listing.grade}
          </Badge>
        </div>

        <ImageGallery photos={listing.photos || []} cropName={listing.crop} />

        <Card>
          <CardContent className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price per kg</p>
                <p className="text-3xl font-bold text-primary">₱{listing.price}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-semibold">{listing.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{listing.municipality}, Masbate</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Harvest Date:</span>
                  <span className="font-medium">{listing.harvest_date || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Grade:</span>
                  <span className="font-medium">Grade {listing.grade}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{listing.description || "No description provided."}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {(listing.farmer?.full_name || "F")?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{listing.farmer?.full_name || "Farmer"}</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 shrink-0">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{listing.farmer?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {listing.farmer?.phone ? (
            <a href={`tel:${listing.farmer.phone}`} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Phone className="w-4 h-4 mr-2" />
              Call {listing.farmer.phone}
            </a>
          ) : (
            <Button disabled className="cursor-not-allowed">
              <Phone className="w-4 h-4 mr-2" />
              No Contact Number
            </Button>
          )}
          <Button variant="outline" className="cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
