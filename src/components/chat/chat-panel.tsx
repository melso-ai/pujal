"use client";

import { getToolName, isToolUIPart } from "ai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckIcon,
  LoaderCircleIcon,
  MailIcon,
  PanelRightCloseIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/app/api/chat/route";
import { ChatComposer } from "@/components/chat/chat-composer";
import { useChat } from "@/components/chat/chat-provider";
import { MelsoMark } from "@/components/chat/melso-mark";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { suggestionsFor, type Card } from "@/lib/assistant";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  resumObres: "Consultant obres",
  detallObra: "Llegint la fitxa de l'obra",
  facturesPendents: "Revisant factures",
  pendentCobrar: "Revisant cobraments",
  contractesPendents: "Revisant contractes",
  estudisEnCurs: "Consultant estudis",
  millorsOfertes: "Comparant ofertes",
  discrepancies: "Creuant amidaments i plànols",
  calcularPreu: "Calculant el full de tancament",
  dadesPendents: "Revisant les dades",
  redactarCorreu: "Redactant el correu",
  preuReferencia: "Buscant preus tancats",
  oportunitatsVolum: "Buscant volum a agrupar",
  ofertesPedrasses: "Llegint les ofertes de Pedrasses",
  electricPedrasses: "Comparant Besoli i EFHYS línia a línia",
  industrials: "Buscant industrials",
};

type Email = { per: string; assumpte: string; cos: string };

function HeaderButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={onClick}
            className="text-muted-foreground"
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function AssistantAvatar() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-[#fdf8df]">
      <MelsoMark className="size-3.5" />
    </span>
  );
}

function DataCard({ card }: { card: Card }) {
  return (
    <div className="flex flex-col gap-2 duration-300 animate-in fade-in slide-in-from-bottom-1">
      <div className="flex flex-col rounded-tile bg-surface-inset p-1">
        <span className="px-2.5 pt-1.5 pb-1 text-caption font-medium text-muted-foreground">
          {card.title}
        </span>
        {card.rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-1.5">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-label">{row.label}</span>
              {row.hint && <span className="truncate text-caption text-muted-foreground">{row.hint}</span>}
            </div>
            <span className="shrink-0 font-mono text-label tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
      {card.links && (
        <div className="flex flex-wrap gap-2">
          {card.links.map((link) => (
            <Button
              key={link.href}
              variant="outline"
              size="sm"
              className="rounded-full"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmailCard({ email }: { email: Email }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-tile bg-surface-inset p-3 duration-300 animate-in fade-in slide-in-from-bottom-1">
      <div className="flex items-center gap-2 text-caption text-muted-foreground">
        <MailIcon className="size-3.5" />
        <span className="truncate">Per a {email.per}</span>
      </div>
      <p className="text-label font-medium">{email.assumpte}</p>
      <p className="text-label whitespace-pre-wrap text-muted-foreground">{email.cos}</p>
      <Button size="sm" className="self-start rounded-full" disabled={sent} onClick={() => setSent(true)}>
        {sent ? <CheckIcon data-icon="inline-start" /> : <MailIcon data-icon="inline-start" />}
        {sent ? "Enviat" : "Enviar"}
      </Button>
    </div>
  );
}

function ToolStep({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-caption text-muted-foreground">
      {done ? (
        <CheckIcon className="size-3.5 text-success" />
      ) : (
        <LoaderCircleIcon className="size-3.5 animate-spin" />
      )}
      <span>{label}</span>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex h-6 items-center gap-1" aria-label="Pensant">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function AssistantParts({ message }: { message: ChatMessage }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 pt-0.5">
      {message.parts.map((part, i) => {
        if (part.type === "text") {
          return part.text.trim() ? (
            <p key={i} className="text-body whitespace-pre-wrap">
              {part.text}
            </p>
          ) : null;
        }
        if (!isToolUIPart(part)) return null;
        const name = getToolName(part);
        const done = part.state === "output-available";
        const output = done ? (part.output as unknown) : undefined;
        return (
          <div key={i} className="flex flex-col gap-2">
            <ToolStep label={TOOL_LABELS[name] ?? "Consultant dades"} done={done || part.state === "output-error"} />
            {name === "redactarCorreu" && output ? (
              <EmailCard email={output as Email} />
            ) : output && typeof output === "object" && "rows" in output ? (
              <DataCard card={output as Card} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl bg-muted px-4 py-2.5 text-body break-words">{text}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <AssistantAvatar />
      <AssistantParts message={message} />
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-1 flex-col justify-end gap-4 pb-2">
      <div className="flex flex-col gap-2">
        <AssistantAvatar />
        <p className="text-title font-semibold">Com et puc ajudar?</p>
        <p className="text-body text-muted-foreground">Obres, estudis, preus i factures de Pujal.</p>
      </div>
      <div className="flex flex-col items-start gap-2">
        {suggestionsFor(pathname).map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            className="h-auto max-w-full rounded-2xl py-1.5 text-left whitespace-normal"
            onClick={() => onPick(s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { open } = useChat();
  if (!open) return null;
  return <Panel />;
}

function Panel() {
  const { byDefault, messages, busy, error, send, retry, reset, closeChat } = useChat();
  const endRef = useRef<HTMLDivElement>(null);
  const waiting = busy && messages.at(-1)?.role === "user";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, waiting]);

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Assistent"
      className={cn(
        "flex min-h-0 flex-col bg-page-canvas duration-200 animate-in fade-in slide-in-from-right-4 max-md:fixed max-md:inset-0 max-md:z-50 md:relative md:my-2 md:mr-2 md:w-[380px] md:shrink-0 md:rounded-xl md:shadow-[var(--surface-shadow)] md:ring-1 md:ring-surface-border lg:w-[420px]",
        byDefault && "max-md:hidden"
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit]">
        <div className="flex h-12 shrink-0 items-center gap-1 px-2">
          <HeaderButton label="Tancar" onClick={closeChat}>
            <PanelRightCloseIcon />
          </HeaderButton>
          <h2 className="min-w-0 flex-1 truncate text-title-sm font-semibold">Assistent</h2>
          <HeaderButton label="Nou xat" onClick={reset}>
            <PlusIcon />
          </HeaderButton>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-2">
          {messages.length === 0 ? (
            <EmptyState onPick={send} />
          ) : (
            messages.map((m) => <MessageRow key={m.id} message={m} />)
          )}
          {waiting && (
            <div className="flex gap-2.5">
              <AssistantAvatar />
              <Thinking />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-between gap-3 rounded-tile bg-surface-inset px-3 py-2">
              <span className="text-label text-muted-foreground">No s&apos;ha pogut respondre.</span>
              <Button variant="outline" size="sm" className="rounded-full" onClick={retry}>
                <RotateCcwIcon data-icon="inline-start" />
                Reintentar
              </Button>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="shrink-0 p-3 pt-1">
          <ChatComposer onSend={send} disabled={busy} />
        </div>
      </div>
    </aside>
  );
}
