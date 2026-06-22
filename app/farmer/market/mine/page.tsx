"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Store, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/page-container";
import { DeleteListingDialog } from "@/components/market/delete-listing-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [fetchError, setFetchError] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: "",
    title: "",
  });

  const fetchListings = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/listings/mine");
      if (!res.ok) {
        setFetchError(true);
        toast.error("Failed to fetch listings");
        return;
      }
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      setFetchError(true);
      toast.error("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((item: any) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.crop.toLowerCase().includes(searchTerm) ||
      item.municipality.toLowerCase().includes(searchTerm) ||
      (item.description || "").toLowerCase().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">Manage your posted listings</p>
          </div>
          <Link
            href="/farmer/market/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Listing
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your listings..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          defaultValue="active"
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v)}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="active" className="cursor-pointer">Active</TabsTrigger>
            <TabsTrigger value="archived" className="cursor-pointer">Archived</TabsTrigger>
            <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading your listings...</p>
              </div>
            ) : fetchError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-2">Failed to load listings</p>
                <Button variant="outline" onClick={fetchListings} className="cursor-pointer">
                  Try Again
                </Button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {statusFilter === "active"
                    ? "No active listings"
                    : statusFilter === "archived"
                      ? "No archived listings"
                      : "You haven't posted any listings yet"}
                </p>
                <Link
                  href="/farmer/market/new"
                  className="text-primary hover:underline text-sm"
                >
                  Post your first listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((item: any) => (
                  <Card key={item.id} className="h-full">
                    {item.photos?.length > 0 && (
                      <div className="relative h-36 overflow-hidden rounded-t-lg">
                        <img
                          src={item.photos[0]}
                          alt={item.crop}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate">{item.crop}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Store className="w-4 h-4 shrink-0" />
                            <span className="truncate">Your listing</span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs shrink-0",
                            item.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          )}
                        >
                          {item.status === "active" ? "Active" : "Archived"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{item.municipality}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-primary">₱{item.price}/kg</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} available</p>
                        </div>
                        <Badge variant="secondary" className={cn("text-xs", gradeColors[item.grade] || gradeColors.A)}>
                          Grade {item.grade}
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                        <Link
                          href={`/farmer/market/${item.id}?edit=true`}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-9 px-3 text-sm cursor-pointer flex-1"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                        {item.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                id: item.id,
                                title: item.crop,
                              })
                            }
                            className="cursor-pointer text-destructive hover:text-destructive flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Archive
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <DeleteListingDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        listingId={deleteDialog.id}
        listingTitle={deleteDialog.title}
        onSuccess={fetchListings}
      />
    </PageContainer>
  );
}
