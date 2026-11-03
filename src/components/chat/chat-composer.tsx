"use client";

import { ArrowUpIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const empty = value.trim() === "";

  const submit = () => {
    if (empty || disabled) return;
    onSend(value);
    setValue("");
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-2 rounded-card bg-card/85 p-3 shadow-[var(--composer-shadow)] ring-1 ring-surface-border backdrop-blur-2xl"
    >
      <Textarea
        autoFocus
        rows={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="Pregunta sobre obres, pressupostos o factures…"
        aria-label="Missatge"
        className="max-h-40 min-h-0 resize-none border-0 bg-transparent px-1.5 py-1 text-body shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <div className="flex items-center justify-between">
        <span className="px-1.5 text-caption text-faint-foreground">Claude · dades de mostra</span>
        <Button type="submit" size="icon" disabled={empty || disabled} aria-label="Enviar" className="size-8 rounded-full">
          <ArrowUpIcon />
        </Button>
      </div>
    </form>
  );
}
