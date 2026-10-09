"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstall } from "./install-provider";

const DISMISS_KEY = "kita-ani-install-dismissed";
const DISMISS_EVENT = "kita-ani-install-dismiss";

function subscribeDismiss(cb: () => void) {
  window.addEventListener(DISMISS_EVENT, cb);
  return () => window.removeEventListener(DISMISS_EVENT, cb);
}

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function InstallBanner() {
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstall();
  const [showSteps, setShowSteps] = useState(false);

  const dismissed = useSyncExternalStore(subscribeDismiss, readDismissed, () => true);

  if (isInstalled || dismissed || !(canInstall || isIOS)) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    window.dispatchEvent(new Event(DISMISS_EVENT));
  };

  return (
    <div
      role="region"
      aria-label="Install Kita-Ani"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-xl rounded-2xl border border-border bg-background/95 backdrop-blur shadow-lg p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="size-10 rounded-xl shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">Install Kita-Ani</p>
            <p className="text-xs text-muted-foreground leading-snug">
              Add it to your home screen for faster access, even on weak signal.
            </p>
          </div>
          <Button
            size="sm"
            className="cursor-pointer min-h-[44px]"
            onClick={() => (isIOS && !canInstall ? setShowSteps((s) => !s) : promptInstall())}
          >
            <Download className="size-4 mr-1" />
            Install
          </Button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {showSteps && (
          <ol className="mt-3 space-y-2 text-sm border-t border-border pt-3">
            <li className="flex items-center gap-2">
              <Share className="size-4 shrink-0" /> Tap the Share button in Safari
            </li>
            <li className="flex items-center gap-2">
              <SquarePlus className="size-4 shrink-0" /> Choose “Add to Home Screen”
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}
