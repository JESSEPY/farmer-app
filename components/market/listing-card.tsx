import Link from "next/link";
import { type ReactNode } from "react";
import { MapPin, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  id: string;
  crop: string;
  quantity: string;
  price: number;
  grade: string;
  municipality: string;
  farmerName?: string | null;
  photos?: string[];
  href?: string;
  status?: "active" | "archived";
  actions?: ReactNode;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function ListingCard({ id, crop, quantity, price, grade, municipality, farmerName, photos = [], href, status, actions }: ListingCardProps) {
  const card = (
    <Card className="group/card h-full ring-1 ring-foreground/10 hover:ring-2 hover:ring-primary/30 transition-all duration-200">
      {photos.length > 0 && (
        <div className="relative h-36 overflow-hidden rounded-t-lg">
          <img
            src={photos[0]}
            alt={crop}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover/card:text-primary transition-colors">{crop}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Store className="w-4 h-4 shrink-0" />
              <span className="truncate">{farmerName || "Unknown"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                )}
              >
                {status === "active" ? "Active" : "Archived"}
              </Badge>
            )}
            <Badge variant="secondary" className={cn("text-xs", gradeColors[grade] || gradeColors.A)}>
              Grade {grade}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{municipality}</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary">₱{price}/kg</p>
            <p className="text-xs text-muted-foreground">{quantity} available</p>
          </div>
        </div>
      </CardContent>
      {actions && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          {actions}
        </div>
      )}
    </Card>
  );

  if (href) {
    return <Link key={id} href={href} className="block cursor-pointer">{card}</Link>;
  }

  return card;
}
