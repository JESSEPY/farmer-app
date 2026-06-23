import { Card, CardContent } from "@/components/ui/card";

export function ListingCardSkeleton() {
  return (
    <Card className="h-full animate-pulse">
      <div className="h-36 rounded-t-lg bg-muted" />
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="h-5 bg-muted rounded w-16 shrink-0 ml-2" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="space-y-1 text-right">
              <div className="h-5 bg-muted rounded w-20 ml-auto" />
              <div className="h-3 bg-muted rounded w-16 ml-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
