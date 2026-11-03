"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelRightCloseIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { useChat, type Message } from "@/components/chat/chat-provider";
import { MelsoMark } from "@/components/chat/melso-mark";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { suggestionsFor, type Reply } from "@/lib/assistant";

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

function ReplyContent({ reply }: { reply: Reply }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 pt-0.5">
      <p className="text-body">{reply.text}</p>
      {reply.rows && (
        <div className="flex flex-col rounded-tile bg-surface-inset p-1">
          {reply.rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-1.5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-label">{row.label}</span>
                {row.hint && <span className="truncate text-caption text-muted-foreground">{row.hint}</span>}
              </div>
              {row.value && (
                <span className="shrink-0 font-mono text-label tabular-nums">{row.value}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {reply.links && (
        <div className="flex flex-wrap gap-2">
          {reply.links.map((link) => (
            <Button
              key={link.href}
              variant="outline"
              size="sm"
              className="rounded-full"
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

function MessageRow({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl bg-muted px-4 py-2.5 text-body break-words">
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <AssistantAvatar />
      {message.reply ? <ReplyContent reply={message.reply} /> : <Thinking />}
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
        <p className="text-body text-muted-foreground">
          Pregunta sobre aquesta pantalla. Respon amb les dades de mostra.
        </p>
      </div>
      <div className="flex flex-col items-start gap-2">
        {suggestionsFor(pathname).map((s) => (
          <Button key={s} variant="outline" size="sm" className="rounded-full" onClick={() => onPick(s)}>
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
  const { messages, send, reset, closeChat } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Assistent"
      className="flex min-h-0 flex-col bg-page-canvas duration-200 animate-in fade-in slide-in-from-right-4 max-md:fixed max-md:inset-0 max-md:z-50 md:relative md:my-2 md:mr-2 md:w-[360px] md:shrink-0 md:rounded-xl md:shadow-[var(--surface-shadow)] md:ring-1 md:ring-surface-border lg:w-[400px]"
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
          <div ref={endRef} />
        </div>
        <div className="shrink-0 p-3 pt-1">
          <ChatComposer onSend={send} />
        </div>
      </div>
    </aside>
  );
}
