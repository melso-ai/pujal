"use client";

import { useRouter } from "next/navigation";
import {
  BookMarkedIcon,
  Building2Icon,
  CalculatorIcon,
  DatabaseIcon,
  FilePenLineIcon,
  FilePlusIcon,
  HandshakeIcon,
  HardHatIcon,
  HouseIcon,
  ReceiptTextIcon,
  SendIcon,
  ShoppingCartIcon,
  TagIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useChat } from "@/components/chat/chat-provider";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { agrupables } from "@/lib/compres";
import { estudis, etapesEstudi, obres } from "@/lib/data";
import { industrials, nomFamilia } from "@/lib/industrials";
import { elements } from "@/lib/preus";

export const OPEN_COMMAND_EVENT = "pujal:command";

const pages = [
  { label: "Avui", href: "/", icon: HouseIcon },
  { label: "Pressupostos", href: "/pressupostos", icon: CalculatorIcon },
  { label: "Preus", href: "/preus", icon: TagIcon },
  { label: "Industrials", href: "/industrials", icon: HardHatIcon },
  { label: "Compres agrupades", href: "/compres", icon: ShoppingCartIcon },
  { label: "Obres", href: "/obres", icon: Building2Icon },
  { label: "Contractes", href: "/contractes", icon: FilePenLineIcon },
  { label: "Certificacions", href: "/certificacions", icon: ReceiptTextIcon },
  { label: "Coneixement", href: "/coneixement", icon: BookMarkedIcon },
  { label: "Dades", href: "/dades", icon: DatabaseIcon },
];

export function CommandMenu() {
  const router = useRouter();
  const { openChat } = useChat();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Cercar" description="Obres, estudis i accions">
      <Command>
        <CommandInput placeholder="Cerca obres, estudis o accions…" />
        <CommandList>
          <CommandEmpty>Cap resultat.</CommandEmpty>
          <CommandGroup heading="Accions">
            <CommandItem onSelect={() => go("/pressupostos/nou")}>
              <FilePlusIcon />
              Nou estudi
            </CommandItem>
            <CommandItem value="negociar electricitat pedrasses" onSelect={() => go("/pressupostos/pedrasses/negociar")}>
              <HandshakeIcon />
              Negociar l&apos;electricitat de Pedrasses
            </CommandItem>
            <CommandItem value="nou contracte" onSelect={() => go("/contractes/nou")}>
              <FilePenLineIcon />
              Nou contracte
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                openChat();
              }}
            >
              <SendIcon />
              Preguntar a l&apos;assistent
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Pàgines">
            {pages.map((p) => (
              <CommandItem key={p.href} onSelect={() => go(p.href)}>
                <p.icon />
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Estudis">
            {estudis.map((e) => (
              <CommandItem key={e.id} value={`estudi ${e.nom} ${e.arquitecte}`} onSelect={() => go(`/pressupostos/${e.id}`)}>
                <CalculatorIcon />
                {e.nom}
                <CommandShortcut>{etapesEstudi[e.etapa]}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Preus">
            {elements.map((e) => (
              <CommandItem key={e.id} value={`preu ${e.nom} ${e.capitol}`} onSelect={() => go(`/preus/${e.id}`)}>
                <TagIcon />
                {e.nom}
                <CommandShortcut>{e.unitat}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Compres">
            {agrupables.map((o) => (
              <CommandItem key={o.id} value={`agrupar compra ${o.nom}`} onSelect={() => go(`/compres/${o.id}`)}>
                <ShoppingCartIcon />
                Agrupar {o.nom}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Industrials">
            {industrials.map((i) => (
              <CommandItem
                key={i.id}
                value={`industrial ${i.nom} ${i.families.map(nomFamilia).join(" ")}`}
                onSelect={() => go(`/industrials/${i.id}`)}
              >
                <HardHatIcon />
                {i.nom}
                <CommandShortcut>{i.families[0] ? nomFamilia(i.families[0]) : ""}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Obres">
            {obres.map((o) => (
              <CommandItem key={o.id} value={`obra ${o.nom} ${o.obs} ${o.capObra}`} onSelect={() => go(`/obres/${o.id}`)}>
                <Building2Icon />
                {o.nom}
                <CommandShortcut>{o.obs}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
