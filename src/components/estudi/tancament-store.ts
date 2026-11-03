"use client";

import { useSyncExternalStore } from "react";

export type VariablesTancament = {
  mesos: number;
  persones: number;
  preuBase: number;
  acompanyar: boolean;
  revisio: boolean;
};

export const preuTancament = (v: VariablesTancament) =>
  v.acompanyar ? Math.round(v.preuBase * 1.1) : v.preuBase;

const subscribe = (notify: () => void) => {
  window.addEventListener("pujal:tancament", notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener("pujal:tancament", notify);
    window.removeEventListener("storage", notify);
  };
};

export function useTancament(id: string, preuInicial: number) {
  const inicial: VariablesTancament = {
    mesos: 14,
    persones: 3,
    preuBase: preuInicial,
    acompanyar: false,
    revisio: false,
  };
  const fallback = JSON.stringify(inicial);
  const key = `pujal:tancament:${id}`;
  const snapshot = useSyncExternalStore(subscribe, () => {
    try {
      return window.localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }, () => fallback);
  let values = inicial;
  try {
    const parsed = JSON.parse(snapshot) as VariablesTancament;
    if (Number.isFinite(parsed.preuBase) && parsed.preuBase > 0 && Number.isFinite(parsed.mesos) && parsed.mesos >= 1 && Number.isFinite(parsed.persones) && parsed.persones >= 0) values = parsed;
  } catch {}

  const save = (next: VariablesTancament) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event("pujal:tancament"));
      return true;
    } catch {
      return false;
    }
  };

  return { values, save };
}
