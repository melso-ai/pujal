"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { answer, type Reply } from "@/lib/assistant";

export type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; reply?: Reply };

type ChatState = {
  open: boolean;
  messages: Message[];
  openChat: () => void;
  closeChat: () => void;
  send: (text: string) => void;
  reset: () => void;
};

const ChatContext = createContext<ChatState | null>(null);

const REPLY_DELAY_MS = 700;

export function useChat() {
  const chat = use(ChatContext);
  if (!chat) throw new Error("useChat must be used within ChatProvider");
  return chat;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile, open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const nextId = useRef(0);
  // The panel borrows the nav's space while open, like Melso's Ask panel.
  const parkedSidebar = useRef(false);

  const openChat = useCallback(() => {
    if (!isMobile && sidebarOpen) {
      parkedSidebar.current = true;
      setSidebarOpen(false);
    }
    setOpen(true);
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  const closeChat = useCallback(() => {
    setOpen(false);
    if (parkedSidebar.current) {
      parkedSidebar.current = false;
      setSidebarOpen(true);
    }
  }, [setSidebarOpen]);

  const send = useCallback(
    (text: string) => {
      const question = text.trim();
      if (!question) return;
      const userId = nextId.current++;
      const replyId = nextId.current++;
      const reply = answer(question, pathname);
      setMessages((m) => [
        ...m,
        { id: userId, role: "user", text: question },
        { id: replyId, role: "assistant" },
      ]);
      setTimeout(() => {
        setMessages((m) => m.map((msg) => (msg.id === replyId ? { ...msg, reply } : msg)));
      }, REPLY_DELAY_MS);
      openChat();
    },
    [pathname, openChat]
  );

  const reset = useCallback(() => setMessages([]), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (open) closeChat();
        else openChat();
      } else if (event.key === "Escape" && open && !event.defaultPrevented) {
        closeChat();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openChat, closeChat]);

  const value = useMemo(
    () => ({ open, messages, openChat, closeChat, send, reset }),
    [open, messages, openChat, closeChat, send, reset]
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}
