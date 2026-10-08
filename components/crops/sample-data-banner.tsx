import { Info } from "lucide-react";

/** Shown wherever the API returned built-in demo records instead of the farmer's own. */
export function SampleDataBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200 ${className}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-medium">Sample data.</span> These are example crops to show how the app works. Add your own
        planting to replace them.
      </p>
    </div>
  );
}

export function SampleDataTag() {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
      Sample data
    </span>
  );
}
