import { Badge } from "@/components/ui/badge";
import type { ObraEstat } from "@/lib/data";

const variant: Record<ObraEstat, React.ComponentProps<typeof Badge>["variant"]> = {
  Estudi: "outline",
  Adjudicada: "secondary",
  "En execució": "default",
  Tancament: "secondary",
  Garantia: "outline",
};

export function EstatBadge({ estat }: { estat: ObraEstat }) {
  return <Badge variant={variant[estat]}>{estat}</Badge>;
}
