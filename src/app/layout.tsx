import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { AskComposer } from "@/components/chat/ask-launchers";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatProvider } from "@/components/chat/chat-provider";
import { CommandMenu } from "@/components/command-menu";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pujal",
  description: "Construccions Pujal",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ca"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <TooltipProvider>
          <SidebarProvider className="h-svh bg-app-shell">
            <ChatProvider>
              <AppSidebar />
              <SidebarInset className="min-w-0 overflow-hidden md:peer-data-[variant=inset]:shadow-[var(--surface-shadow)] md:peer-data-[variant=inset]:ring-1 md:peer-data-[variant=inset]:ring-surface-border">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-24">
                  {children}
                </div>
                <AskComposer />
              </SidebarInset>
              <ChatPanel />
              <CommandMenu />
            </ChatProvider>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
