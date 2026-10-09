"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstall } from "./install-provider";

export function InstallButton() {
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstall();
  const [showSteps, setShowSteps] = useState(false);

  if (isInstalled || !(canInstall || isIOS)) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Install app"
        title="Install app"
        className="cursor-pointer min-w-[44px] min-h-[44px]"
        onClick={() => (isIOS && !canInstall ? setShowSteps((s) => !s) : promptInstall())}
      >
        <Download className="w-5 h-5" />
      </Button>
      {showSteps && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-border bg-background p-3 text-sm shadow-lg z-50">
          Tap the Share button in Safari, then choose “Add to Home Screen”.
        </div>
      )}
    </div>
  );
}
