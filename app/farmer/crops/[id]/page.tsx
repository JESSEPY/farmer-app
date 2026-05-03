"use client";

import { use } from "react";
import { ArrowLeft, MapPin, Calendar, Ruler, Sprout, Leaf, Droplets, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

interface CropDetailProps {
  params: Promise<{ id: string }>;
}

const mockCropDetail = {
  id: "1",
  name: "Rice (Palay)",
  field: "North Field",
  municipality: "Mobo",
  area: 2.5,
  plantingDate: "2026-03-15",
  expectedHarvest: "2026-06-15",
  status: "growing" as const,
  daysToHarvest: 45,
  currentStage: "tillering",
  stages: [
    { name: "Planting", date: "2026-03-15", completed: true, current: false },
    { name: "Basal Fertilizer", date: "2026-03-22", completed: true, current: false },
    { name: "Germination", date: "2026-03-25", completed: true, current: false },
    { name: "Tillering", date: "2026-04-10", completed: true, current: true },
    { name: "Side-dress", date: "2026-04-20", completed: false, current: false, upcoming: true },
    { name: "Panicle Init", date: "2026-05-15", completed: false, current: false },
    { name: "Flowering", date: "2026-06-01", completed: false, current: false },
    { name: "Harvest", date: "2026-06-15", completed: false, current: false },
  ],
  nextAction: {
    type: "fertilizer",
    title: "Side-dress Application Due",
    description: "Apply urea fertilizer 21-30 days after planting",
    date: "2026-04-20",
  },
  pestAlerts: [
    { type: "warning", title: "Brown Planthopper Risk", description: "Monitor closely, avoid excessive nitrogen" },
    { type: "info", title: "Weather Alert", description: "Heavy rain expected - ensure proper drainage" },
  ],
  notes: "Soil condition good. Applied organic compost before planting.",
};

export default function CropDetailPage({ params }: CropDetailProps) {
  const { id } = use(params);
  const crop = mockCropDetail;

  const statusColors = {
    planted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    growing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "harvest-ready": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };

  const currentStageIndex = crop.stages.findIndex(s => s.current);
  const progress = ((currentStageIndex + 1) / crop.stages.length) * 100;

  return (
    <PageContainer>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/farmer/crops" 
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{crop.name}</h1>
              <Badge variant="secondary" className={cn("text-xs", statusColors[crop.status])}>
                {crop.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{crop.field} • {crop.municipality}</p>
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Growth Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Stage: <span className="font-medium text-foreground capitalize">{crop.currentStage}</span></span>
                <span className="text-muted-foreground">{crop.daysToHarvest} days to harvest</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Stage Timeline */}
              <div className="relative">
                <div className="flex justify-between overflow-x-auto pb-2">
                  {crop.stages.map((stage, index) => (
                    <div 
                      key={stage.name}
                      className={cn(
                        "flex flex-col items-center min-w-[60px]",
                        stage.completed && "text-primary",
                        stage.current && "text-primary",
                        !stage.completed && !stage.current && "text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full mb-2",
                        stage.current ? "bg-primary ring-2 ring-primary/30" :
                        stage.completed ? "bg-primary" : "bg-muted"
                      )} />
                      <span className="text-xs font-medium">{stage.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Action Alert */}
        {crop.nextAction && (
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{crop.nextAction.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{crop.nextAction.description}</p>
                  <p className="text-xs text-accent mt-2">Due: {crop.nextAction.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Field Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{crop.municipality}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">{crop.area} hectares</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Planted:</span>
                  <span className="font-medium">{crop.plantingDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sprout className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expected Harvest:</span>
                  <span className="font-medium">{crop.expectedHarvest}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pest Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {crop.pestAlerts.map((alert, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="w-4 h-4 text-secondary" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{crop.notes}</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="cursor-pointer">
            Update Status
          </Button>
          <Button variant="outline" className="cursor-pointer">
            Add Note
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}