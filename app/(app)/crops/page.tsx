import Link from "next/link";
import { Plus, Sprout, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

const crops = [
  { id: "1", name: "Rice (Palay)", field: "North Field", area: 2.5, status: "growing", daysLeft: 45 },
  { id: "2", name: "Corn", field: "East Lot", area: 1.2, status: "harvest-ready", daysLeft: 0 },
  { id: "3", name: "Coconut", field: "West Orchard", area: 3.0, status: "planted", daysLeft: 180 },
  { id: "4", name: "Cassava", field: "South Plot", area: 0.8, status: "growing", daysLeft: 90 },
];

const statusColors = {
  planted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  growing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "harvest-ready": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export default function CropsPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Crops</h1>
            <p className="text-muted-foreground">Manage your fields and plantings</p>
          </div>
          <Link href="/crops/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Crop
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">4</p>
            <p className="text-xs text-muted-foreground">Total Crops</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">7.5 ha</p>
            <p className="text-xs text-muted-foreground">Total Area</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">1</p>
            <p className="text-xs text-muted-foreground">Ready to Harvest</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">2</p>
            <p className="text-xs text-muted-foreground">Need Care</p>
          </div>
        </div>

        {/* Crop List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <Link key={crop.id} href={`/crops/${crop.id}`}>
              <Card className="cursor-pointer hover:bg-muted/50 transition-all duration-200 border border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", statusColors[crop.status as keyof typeof statusColors])}>
                      {crop.status === "harvest-ready" ? "Ready" : crop.status}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg">{crop.name}</h3>
                  
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{crop.field}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{crop.area} ha • {crop.daysLeft === 0 ? "Harvest now" : `${crop.daysLeft} days`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Add New Card */}
          <Link href="/crops/new">
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed border-2 hover:border-primary/50">
              <CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px]">
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-medium">Add New Crop</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}