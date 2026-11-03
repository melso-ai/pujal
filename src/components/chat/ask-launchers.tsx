"use client";

import { ArrowUpIcon, SendIcon } from "lucide-react";

import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export function AskButton() {
  const { open, byDefault, openChat } = useChat();
  if (open && !byDefault) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={openChat}
      className={cn("h-7 rounded-full px-2.5 text-label", open && "md:hidden")}
    >
      <SendIcon data-icon="inline-start" />
      <span className="hidden sm:inline">Preguntar</span>
    </Button>
  );
}

export function AskComposer() {
  const { open, byDefault, openChat } = useChat();
  if (open && !byDefault) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6",
        open && "md:hidden"
      )}
    >
      <button
        type="button"
        onClick={openChat}
        className="pointer-events-auto mx-auto flex h-[50px] w-full max-w-3xl cursor-text items-center gap-3 rounded-full border-[0.5px] border-input bg-surface/85 pr-2 pl-5 text-left shadow-[var(--composer-shadow)] backdrop-blur-2xl transition-colors hover:bg-surface"
      >
        <span className="min-w-0 flex-1 truncate text-body text-muted-foreground">
          Pregunta a l&apos;assistent…
        </span>
        <Kbd className="hidden sm:inline-flex">⌘J</Kbd>
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ArrowUpIcon className="size-4" />
        </span>
      </button>
    </div>
  );
}
