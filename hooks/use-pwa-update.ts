"use client";

import { useState, useEffect, useCallback } from "react";

interface PWAUpdateState {
  hasUpdate: boolean;
  pendingVersion: string | null;
}

export function usePWAUpdate() {
  const [state, setState] = useState<PWAUpdateState>({
    hasUpdate: false,
    pendingVersion: null,
  });

  const checkForUpdate = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        registration.update();
        
        const response = await fetch("/api/version?t=" + Date.now());
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.version) return;
        
        const cachedVersion = localStorage.getItem("appVersion");
        
        if (cachedVersion && data.version !== cachedVersion) {
          setState({
            hasUpdate: true,
            pendingVersion: data.version,
          });
        } else if (!cachedVersion) {
          localStorage.setItem("appVersion", data.version);
        }
      }
    } catch (error) {
      console.error("Update check failed:", error);
    }
  }, []);

  useEffect(() => {
    checkForUpdate();
    
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "UPDATE_AVAILABLE") {
          setState({
            hasUpdate: true,
            pendingVersion: event.data.version,
          });
        }
      };
      
      navigator.serviceWorker.addEventListener("message", handleMessage);
    }
  }, [checkForUpdate]);

  const dismissUpdate = useCallback(() => {
    if (state.pendingVersion) {
      localStorage.setItem("appVersion", state.pendingVersion);
      setState({
        hasUpdate: false,
        pendingVersion: null,
      });
    }
  }, [state.pendingVersion]);

  return {
    ...state,
    checkForUpdate,
    dismissUpdate,
  };
}