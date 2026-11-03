"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
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
import type { ChatMessage } from "@/app/api/chat/route";

type ChatState = {
  open: boolean;
  messages: ChatMessage[];
  busy: boolean;
  error: Error | undefined;
  openChat: () => void;
  closeChat: () => void;
  send: (text: string) => void;
  retry: () => void;
  reset: () => void;
};

const ChatContext = createContext<ChatState | null>(null);

export function useChat() {
  const chat = use(ChatContext);
  if (!chat) throw new Error("useChat must be used within ChatProvider");
  return chat;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile, open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, status, error, regenerate, setMessages, stop } =
    useAIChat<ChatMessage>();
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
      void sendMessage({ text: question }, { body: { pathname } });
      openChat();
    },
    [sendMessage, pathname, openChat]
  );

  const retry = useCallback(() => {
    void regenerate({ body: { pathname } });
  }, [regenerate, pathname]);

  const reset = useCallback(() => {
    void stop();
    setMessages([]);
  }, [stop, setMessages]);

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

  const busy = status === "submitted" || status === "streaming";

  const value = useMemo(
    () => ({ open, messages, busy, error, openChat, closeChat, send, retry, reset }),
    [open, messages, busy, error, openChat, closeChat, send, retry, reset]
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}
