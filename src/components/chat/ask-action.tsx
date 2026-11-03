"use client";

import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";

// A page action that hands the task to the assistant instead of a static form.
export function AskAction({
  prompt,
  children,
  ...props
}: { prompt: string } & Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const { send } = useChat();
  return (
    <Button {...props} onClick={() => send(prompt)}>
      {children}
    </Button>
  );
}
