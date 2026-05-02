"use client";

import { use } from "react";
import { ArrowLeft, MapPin, Store, Star, Phone, MessageCircle, ShieldCheck, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

interface ListingDetailProps {
  params: Promise<{ id: string }>;
}

const mockListing = {
  id: "1",
  crop: "Rice (Palay)",
  quantity: 500,
  pricePerKg: 22,
  grade: "A" as const,
  municipality: "Mobo",
  harvestDate: "2026-04-20",
  postedDate: "2026-04-25",
  description: "Premium quality fresh palay. Harvested this season, well-dried and properly stored. Suitable for milling. No pesticides used. Contact for bulk orders.",
  photos: [],
  farmer: {
    id: "f1",
    name: "Juan Dela Cruz",
    verified: true,
    rating: 4.8,
    totalSales: 45,
    memberSince: "2024",
    phone: "+63 912 345 6789",
  },
  similarListings: [
    { id: "2", crop: "Rice (Palay)", quantity: 300, price: 20, municipality: "Milagros" },
    { id: "3", crop: "Rice (Palay)", quantity: 800, price: 23, municipality: "Aroroy" },
  ],
};

const gradeColors = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function ListingDetailPage({ params }: ListingDetailProps) {
  const { id } = use(params);
  const listing = mockListing;

  return (
    <PageContainer>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/market" 
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{listing.crop}</h1>
            <p className="text-muted-foreground">Posted {listing.postedDate}</p>
          </div>
          <Badge variant="secondary" className={cn("text-xs", gradeColors[listing.grade])}>
            Grade {listing.grade}
          </Badge>
        </div>

        {/* Price & Quantity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price per kg</p>
                <p className="text-3xl font-bold text-primary">₱{listing.pricePerKg}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-semibold">{listing.quantity} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
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
                  <span className="font-medium">{listing.harvestDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Grade:</span>
                  <span className="font-medium">Grade {listing.grade} (Premium)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{listing.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Farmer Info */}
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
                  {listing.farmer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{listing.farmer.name}</p>
                  {listing.farmer.verified && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={cn(
                        "w-3.5 h-3.5", 
                        star <= listing.farmer.rating 
                          ? "fill-warning text-warning" 
                          : "text-muted-foreground"
                      )} 
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {listing.farmer.rating} ({listing.farmer.totalSales} sales)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {listing.farmer.memberSince}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Button className="cursor-pointer">
            <Phone className="w-4 h-4 mr-2" />
            Call Seller
          </Button>
          <Button variant="outline" className="cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>

        {/* Similar Listings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Similar Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {listing.similarListings.map((item) => (
              <Link 
                key={item.id} 
                href={`/market/${item.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{item.crop}</p>
                  <p className="text-xs text-muted-foreground">{item.municipality} • {item.quantity}kg</p>
                </div>
                <p className="font-semibold text-primary">₱{item.price}/kg</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}