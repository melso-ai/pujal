import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

// Site-wide password for the prototype, because it holds real project data.
// No matcher on purpose: it also closes public/ and _next/static, whose chunks contain that data.
const COOKIE = "pujal_acces";
const RUTA = "/__acces";
const TRENTA_DIES = 60 * 60 * 24 * 30;

const resum = (text: string) => createHash("sha256").update(`pujal-prototip:${text}`).digest();
const igual = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);
const segur = (desti: unknown) => (typeof desti === "string" && /^\/(?![/\\])/.test(desti) ? desti : "/");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function pagina(desti: string, error: boolean) {
  const html = `<!doctype html>
<html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Pujal · Accés</title>
<style>
:root{color-scheme:light dark;--bg:#fafafa;--card:#fff;--text:#0a0a0a;--muted:#666;--line:rgba(0,0,0,.1);--input:#f5f5f5;--btn:#171717;--btn-text:#fafafa;--error:#c84037}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0a;--card:#171717;--text:#fafafa;--muted:#a1a1a1;--line:rgba(255,255,255,.1);--input:#262626;--btn:#e5e5e5;--btn-text:#171717;--error:#f48171}}
*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--text);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
form{width:100%;max-width:360px;display:grid;gap:12px;padding:24px;background:var(--card);border-radius:14px;box-shadow:0 0 0 1px var(--line),0 4px 16px -4px rgba(0,0,0,.08)}
h1{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em}p{margin:0;color:var(--muted)}
label{font-size:13px;font-weight:500}input{width:100%;height:40px;margin-top:6px;padding:0 12px;border:0;border-radius:10px;background:var(--input);color:inherit;font:inherit}
input:focus-visible,button:focus-visible{outline:2px solid #f04e42;outline-offset:2px}
button{height:40px;border:0;border-radius:99px;background:var(--btn);color:var(--btn-text);font:inherit;font-weight:500;cursor:pointer}.error{color:var(--error);font-size:13px}
</style></head><body>
<form method="post" action="${RUTA}">
<h1>Prototip de Pujal</h1><p>Conté dades reals de projectes. Introdueix la contrasenya per entrar.</p>
<label>Contrasenya<input type="password" name="contrasenya" autocomplete="current-password" autofocus required></label>
<input type="hidden" name="desti" value="${esc(desti)}">
${error ? '<p class="error" role="alert">Contrasenya incorrecta.</p>' : ""}
<button type="submit">Entrar</button>
</form></body></html>`;
  return new NextResponse(html, { status: 401, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export async function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const contrasenya = process.env.PUJAL_PASSWORD;
  // Fail closed: a missing variable must never open the site.
  if (!contrasenya) return new NextResponse("Accés no configurat.", { status: 503, headers: { "cache-control": "no-store" } });

  const clau = resum(contrasenya);
  const { pathname, search } = request.nextUrl;
  const galeta = request.cookies.get(COOKIE)?.value;

  if (galeta && igual(Buffer.from(galeta, "hex"), clau)) {
    return pathname === RUTA ? NextResponse.redirect(new URL("/", request.url), 303) : NextResponse.next();
  }

  if (pathname === RUTA && request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const provada = form?.get("contrasenya");
    const desti = segur(form?.get("desti"));
    if (typeof provada !== "string" || !igual(resum(provada), clau)) return pagina(desti, true);
    const resposta = NextResponse.redirect(new URL(desti, request.url), 303);
    resposta.cookies.set({ name: COOKIE, value: clau.toString("hex"), httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: TRENTA_DIES });
    return resposta;
  }

  return pagina(pathname === RUTA ? "/" : segur(`${pathname}${search}`), false);
}
