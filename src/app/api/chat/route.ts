import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  tool,
  type InferUITools,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import { z } from "zod";

import {
  calcularPreu,
  contextFor,
  contractesPendents,
  dadesPendents,
  detallObra,
  discrepanciesAmidaments,
  estudisEnCurs,
  facturesPendents,
  millorsOfertes,
  oportunitatsVolum,
  pendentCobrar,
  preuReferencia,
  resumObres,
} from "@/lib/assistant";
import { obres } from "@/lib/data";
import { elements } from "@/lib/preus";

export const maxDuration = 60;

const noInput = z.object({});

const tools = {
  resumObres: tool({
    description: "Totes les obres amb estat, marge previst vs estudi i % certificat.",
    inputSchema: noInput,
    execute: async () => resumObres(),
  }),
  detallObra: tool({
    description: "Detall d'una obra: marge, import, certificat, facturat, cobrat, pendent de contractar.",
    inputSchema: z.object({ id: z.enum(obres.map((o) => o.id) as [string, ...string[]]) }),
    execute: async ({ id }) => detallObra(id),
  }),
  facturesPendents: tool({
    description: "Factures de cost pendents d'aprovar i a quin pas del circuit d'aprovació són.",
    inputSchema: noInput,
    execute: async () => facturesPendents(),
  }),
  pendentCobrar: tool({
    description: "Import facturat i pendent de cobrar per obra.",
    inputSchema: noInput,
    execute: async () => pendentCobrar(),
  }),
  contractesPendents: tool({
    description: "Contractes amb industrials pendents de signar.",
    inputSchema: noInput,
    execute: async () => contractesPendents(),
  }),
  estudisEnCurs: tool({
    description: "Estudis/pressupostos en curs amb etapa i data de lliurament.",
    inputSchema: noInput,
    execute: async () => estudisEnCurs(),
  }),
  millorsOfertes: tool({
    description: "Comparatiu d'ofertes d'industrials: millor oferta per partida vs preu de referència.",
    inputSchema: noInput,
    execute: async () => millorsOfertes(),
  }),
  discrepancies: tool({
    description: "Discrepàncies detectades entre amidaments, plànols i memòria de qualitats de l'estudi.",
    inputSchema: noInput,
    execute: async () => discrepanciesAmidaments(),
  }),
  calcularPreu: tool({
    description: "Full de tancament: preu d'oferta necessari per a un % de benefici net, amb K i indirectes.",
    inputSchema: z.object({
      margeNet: z.number().describe("Benefici net objectiu en %, p. ex. 3"),
      mesos: z.number().optional().describe("Durada de l'obra en mesos (14 per defecte)"),
      persones: z.number().optional().describe("Persones a l'obra (3 per defecte)"),
    }),
    execute: async (input) => calcularPreu(input),
  }),
  preuReferencia: tool({
    description: `Preus que Pujal ha tancat per a un element (${elements.map((e) => e.nom).join(", ")}): preu de referència per a estudis, millor industrial, sobrecost i estalvi agrupant volum.`,
    inputSchema: z.object({ id: z.enum(elements.map((e) => e.id) as [string, ...string[]]) }),
    execute: async ({ id }) => preuReferencia(id),
  }),
  oportunitatsVolum: tool({
    description: "Elements on es pot agrupar volum entre obres els propers mesos i l'estalvi estimat.",
    inputSchema: noInput,
    execute: async () => oportunitatsVolum(),
  }),
  dadesPendents: tool({
    description: "Fonts de dades que falten per començar el projecte (accés SQL, exemples, etc.).",
    inputSchema: noInput,
    execute: async () => dadesPendents(),
  }),
  redactarCorreu: tool({
    description: "Redacta un correu curt en català per a un industrial, client o arquitecte. No l'envia.",
    inputSchema: z.object({
      per: z.string().describe("Destinatari, p. ex. Clima Valira"),
      assumpte: z.string(),
      cos: z.string().describe("Cos del correu, 3-6 frases, to professional i proper"),
    }),
    execute: async (draft) => draft,
  }),
};

export type ChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>;

function systemPrompt(pathname: string) {
  const { obraId, estudiId } = contextFor(pathname);
  const here = obraId
    ? `L'usuari és a la fitxa de l'obra «${obraId}».`
    : estudiId
      ? `L'usuari és a l'estudi «${estudiId}».`
      : `L'usuari és a ${pathname}.`;
  return [
    "Ets l'assistent de Construccions Pujal (constructora d'Andorra) dins del seu ERP, fet per Melso.",
    "Avui és 3 de novembre de 2026. La responsable d'estudis és la Jennifer; la direcció signa en Benito.",
    here,
    "Fes servir sempre les eines per a qualsevol xifra; no inventis dades. Les dades són de mostra.",
    "La interfície ja mostra el resultat de cada eina com una targeta: no repeteixis les files.",
    "Respon en la llengua de l'usuari (català per defecte), en text pla sense markdown, 1-2 frases que diguin què vol dir i què cal fer.",
  ].join("\n");
}

export async function POST(req: Request) {
  const { messages, pathname = "/" }: { messages: ChatMessage[]; pathname?: string } =
    await req.json();

  const result = streamText({
    model: "anthropic/claude-sonnet-5.5",
    system: systemPrompt(pathname),
    messages: await convertToModelMessages(messages.slice(-20)),
    tools,
    stopWhen: isStepCount(5),
    maxOutputTokens: 800,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
