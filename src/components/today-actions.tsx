"use client";

import Link from "next/link";
import {
  CheckIcon,
  FolderInputIcon,
  InboxIcon,
  LayersIcon,
  ReceiptIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type TodayAction = {
  id: string;
  icon: "projecte" | "ofertes" | "alerta" | "volum" | "factures";
  title: string;
  meta: string;
  value: string;
  action: string;
  href: string;
  primary?: boolean;
};

const ICONS: Record<TodayAction["icon"], LucideIcon> = {
  projecte: FolderInputIcon,
  ofertes: InboxIcon,
  alerta: TriangleAlertIcon,
  volum: LayersIcon,
  factures: ReceiptIcon,
};

export function TodayActions({ items }: { items: TodayAction[] }) {
  const [done, setDone] = useState<string[]>([]);
  const pending = items.filter((i) => !done.includes(i.id));

  if (pending.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-surface-inset px-5 py-6 text-body text-muted-foreground">
        <CheckIcon className="size-4 text-success" />
        Tot fet per avui.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
      {pending.map((item, i) => {
        const Icon = ICONS[item.icon];
        return (
          <div
            key={item.id}
            className={cn(
              "group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-hover sm:px-5",
              i > 0 && "border-t border-surface-border"
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-tile bg-surface-inset text-muted-foreground",
                item.primary && "bg-brand-soft text-brand-text"
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body font-medium">{item.title}</span>
              <span className="truncate text-caption text-muted-foreground">{item.meta}</span>
            </div>
            <span className="hidden shrink-0 font-mono text-label tabular-nums sm:block">{item.value}</span>
            <Button
              size="sm"
              variant={item.primary ? "default" : "outline"}
              className="shrink-0 rounded-full"
              nativeButton={false}
              render={<Link href={item.href} />}
            >
              {item.action}
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Marcar com a fet"
                    className="hidden shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:inline-flex"
                    onClick={() => setDone((d) => [...d, item.id])}
                  >
                    <CheckIcon />
                  </Button>
                }
              />
              <TooltipContent>Fet</TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
