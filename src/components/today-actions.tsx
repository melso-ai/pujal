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

  return (
    <div className="@container flex flex-col gap-3">
      {done.length > 0 && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-card bg-surface-inset px-4 py-3 text-label">
          <span className="flex items-center gap-2"><CheckIcon className="size-4 text-success" />{pending.length === 0 ? "Tot fet per avui." : `${done.length} ${done.length === 1 ? "tasca feta" : "tasques fetes"}`}</span>
          <Button variant="ghost" size="sm" onClick={() => setDone((d) => d.slice(0, -1))}>Desfer</Button>
        </div>
      )}
      {pending.length > 0 && <div className="flex flex-col overflow-hidden rounded-card bg-card ring-1 ring-surface-border">
      {pending.map((item, i) => {
        const Icon = ICONS[item.icon];
        return (
          <div
            key={item.id}
            className={cn(
              "group grid grid-cols-[1fr_auto] items-center gap-3 px-4 @2xl:flex @2xl:gap-4 py-3.5 transition-colors hover:bg-surface-hover @2xl:px-5",
              i > 0 && "border-t border-surface-border"
            )}
          >
            <span
              className={cn(
                "hidden size-9 shrink-0 @2xl:flex items-center justify-center rounded-tile bg-surface-inset text-muted-foreground",
                item.primary && "bg-brand-soft text-brand-text"
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="col-start-1 row-start-1 flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-body font-medium @2xl:truncate">{item.title}</span>
              <span className="text-caption text-muted-foreground @2xl:truncate">{item.meta}</span>
            </div>
            <span className="col-start-1 row-start-2 shrink-0 font-mono text-label tabular-nums">{item.value}</span>
            <Button
              size="sm"
              variant={item.primary ? "default" : "outline"}
              className="col-start-2 row-start-2 shrink-0 rounded-full"
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
                    aria-label={`Marcar com a fet: ${item.title}`}
                    className="col-start-2 row-start-1 shrink-0 text-muted-foreground transition-opacity @2xl:opacity-0 @2xl:group-hover:opacity-100 @2xl:group-focus-within:opacity-100"
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
      </div>}
    </div>
  );
}
