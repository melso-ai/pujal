import { Fragment } from "react";

type Node = { t: "h"; text: string } | { t: "p"; text: string } | { t: "ol" | "ul"; items: string[] };

function parse(src: string) {
  const out: Node[] = [];
  for (const raw of src.split("\n")) {
    const l = raw.trim();
    if (!l) continue;
    const h = l.match(/^#{1,3}\s+(.*)/);
    if (h) {
      out.push({ t: "h", text: h[1] });
      continue;
    }
    const ol = l.match(/^\d+[.)]\s+(.*)/);
    const ul = l.match(/^[-*]\s+(.*)/);
    const m = ol ?? ul;
    if (m) {
      const t = ol ? "ol" : "ul";
      const last = out.at(-1);
      if (last && last.t === t) last.items.push(m[1]);
      else out.push({ t, items: [m[1]] });
      continue;
    }
    out.push({ t: "p", text: l });
  }
  return out;
}

function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

export function Doc({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3 text-body">
      {parse(text).map((n, i) => {
        if (n.t === "h")
          return (
            <h3
              key={i}
              className="pt-3 text-caption font-medium tracking-wide text-muted-foreground uppercase first:pt-0"
            >
              {n.text}
            </h3>
          );
        if (n.t === "p") return <p key={i}>{inline(n.text)}</p>;
        if (n.t === "ol")
          return (
            <ol key={i} className="flex flex-col gap-2.5">
              {n.items.map((it, j) => (
                <li key={j} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-inset font-mono text-caption text-muted-foreground tabular-nums ring-1 ring-surface-border">
                    {j + 1}
                  </span>
                  <span className="min-w-0">{inline(it)}</span>
                </li>
              ))}
            </ol>
          );
        return (
          <ul key={i} className="flex flex-col gap-2">
            {n.items.map((it, j) => (
              <li key={j} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                <span className="min-w-0">{inline(it)}</span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
