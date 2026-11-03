import { Badge } from "@/components/ui/badge";
import { nomEstat, type EstatVisible } from "@/lib/contractes";
import { cn } from "@/lib/utils";

const punt: Record<EstatVisible, string> = {
  esborrany: "bg-muted-foreground",
  enviat: "bg-warning",
  signat: "bg-success",
  caducat: "bg-destructive",
};

export function EstatContracte({ estat, curt, className }: { estat: EstatVisible; curt?: boolean; className?: string }) {
  if (estat === "caducat")
    return (
      <Badge variant="destructive" className={className}>
        {nomEstat.caducat}
      </Badge>
    );
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", punt[estat])} />
      {curt && estat === "enviat" ? "Pendent" : nomEstat[estat]}
    </Badge>
  );
}
