import Link from "next/link";
import { Plus, Search, Filter, MapPin, Store, Grid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/page-container";
import { MarketMap } from "@/components/market/market-map";
import { cn } from "@/lib/utils";

const listings = [
  { id: "1", crop: "Rice (Palay)", quantity: 500, price: 22, grade: "A", municipality: "Mobo", farmer: "Juan Dela Cruz", rating: 4.8 },
  { id: "2", crop: "Fresh Corn", quantity: 200, price: 18, grade: "A", municipality: "Milagros", farmer: "Maria Santos", rating: 4.5 },
  { id: "3", crop: "Coconut (成熟)", quantity: 1000, price: 15, grade: "B", municipality: "Aroroy", farmer: "Pedro Reyes", rating: 4.2 },
  { id: "4", crop: "Cassava", quantity: 300, price: 12, grade: "A", municipality: "Baleno", farmer: "Ana Lopez", rating: 4.9 },
  { id: "5", crop: "Sweet Potato", quantity: 150, price: 25, grade: "A", municipality: "Mobo", farmer: "Luis Garcia", rating: 4.7 },
  { id: "6", crop: "Peanut", quantity: 80, price: 45, grade: "A", municipality: "Pilar", farmer: "Carmen Cruz", rating: 4.6 },
];

const gradeColors = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function MarketPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Market</h1>
            <p className="text-muted-foreground">Browse and list agricultural products</p>
          </div>
          <Link href="/market/new" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Post Listing
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search crops..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* View Toggle */}
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
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item) => (
                <Link key={item.id} href={`/market/${item.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{item.crop}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Store className="w-4 h-4" />
                            <span>{item.farmer}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className={cn("text-xs", gradeColors[item.grade as keyof typeof gradeColors])}>
                          Grade {item.grade}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{item.municipality}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₱{item.price}/kg</p>
                          <p className="text-xs text-muted-foreground">{item.quantity}kg available</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-warning">★</span>
                        <span className="text-xs text-muted-foreground">{item.rating}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
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