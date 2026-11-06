"use client";

import { useEffect, useState } from "react";

export interface Health { connected: boolean | null; cloud: boolean; accessRequired?: boolean; model?: string }

let cache: Health | null = null;
let inflight: Promise<Health> | null = null;

// Whether the server has Claude credentials. Asked once per page load.
export function useHealth(): Health {
  const [h, setH] = useState<Health>(cache ?? { connected: null, cloud: false });
  useEffect(() => {
    if (cache) return;
    inflight ??= fetch("/api/health").then((r) => r.json()).catch(() => ({ connected: false, cloud: false }));
    inflight.then((v) => { cache = v; setH(v); });
  }, []);
  return h;
}
