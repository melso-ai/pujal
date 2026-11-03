"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  Building2Icon,
  CalculatorIcon,
  DatabaseIcon,
  HardHatIcon,
} from "lucide-react";

import { MelsoMark } from "@/components/chat/melso-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const nav = [
  { href: "/", label: "Obres", icon: Building2Icon },
  { href: "/pressupostos", label: "Pressupostos", icon: CalculatorIcon, badge: "6" },
  { href: "/dades", label: "Dades", icon: DatabaseIcon },
];

const properament = [
  { label: "Industrials", icon: HardHatIcon },
  { label: "Contractes", icon: BookOpenIcon },
];

// Melso's nav button: muted until active, active keeps its fill on hover.
const NAV_BUTTON_CLASS =
  "rounded-[0.6rem] text-muted-foreground hover:not-data-active:bg-sidebar-accent/70 data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/obres")
      : pathname.startsWith(href);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} className="h-9 rounded-[0.6rem]">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-micro font-semibold text-primary-foreground">
                P
              </span>
              <span className="text-body font-semibold">Pujal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isActive(item.href)}
                    render={<Link href={item.href} />}
                    className={NAV_BUTTON_CLASS}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="text-caption text-brand-text">{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-3 py-0">
          <SidebarGroupLabel>Properament</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {properament.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label} disabled className={NAV_BUTTON_CLASS}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 pb-1 text-caption text-faint-foreground group-data-[collapsible=icon]:hidden">
          <MelsoMark className="h-3 w-auto text-brand" />
          <span>Prototip amb Melso · v0.2</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
