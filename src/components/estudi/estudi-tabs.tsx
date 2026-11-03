"use client";

import { useSyncExternalStore } from "react";

import { Tabs } from "@/components/ui/tabs";
import { etapesEstudi } from "@/lib/data";

const claus = ["documentacio", "partides", "comparatiu", "tancament", "oferta"];
const subscribe = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};

export function EstudiTabs({ etapa, children }: { etapa: number; children: React.ReactNode }) {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => "");
  const index = claus.indexOf(hash);

  return (
    <Tabs
      className="min-w-0"
      value={etapesEstudi[index < 0 ? etapa : index]}
      onValueChange={(value) => {
        const i = etapesEstudi.findIndex((e) => e === value);
        if (i < 0) return;
        window.history.replaceState(null, "", `#${claus[i]}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }}
    >
      {children}
    </Tabs>
  );
}
