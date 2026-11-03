const eurFmt = new Intl.NumberFormat("ca-AD", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eurPreciseFmt = new Intl.NumberFormat("ca-AD", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const numFmt = new Intl.NumberFormat("ca-AD");

export const eur = (n: number) => eurFmt.format(n);
export const eurPrecise = (n: number) => eurPreciseFmt.format(n);
export const num = (n: number) => numFmt.format(n);
export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export function date(iso: string) {
  return new Date(iso).toLocaleDateString("ca-AD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function eurCompact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toLocaleString("ca-AD", { maximumFractionDigits: 2 })} M€`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 1000).toLocaleString("ca-AD")} k€`;
  return eur(n);
}
