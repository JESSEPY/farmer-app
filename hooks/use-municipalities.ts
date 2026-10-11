"use client";

import { useEffect, useState } from "react";

let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;

function loadMunicipalities(): Promise<string[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= fetch("/api/municipalities")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load municipalities");
      return res.json();
    })
    .then((data: { municipalities: string[] }) => (cache = data.municipalities))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

// The single client-side source for the municipality list, shared by every form, filter and the map.
export function useMunicipalities() {
  const [municipalities, setMunicipalities] = useState<string[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cache) return;
    let active = true;
    loadMunicipalities()
      .then((list) => active && setMunicipalities(list))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { municipalities, loading, error };
}
