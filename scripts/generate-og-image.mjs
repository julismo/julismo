// Gera public/og.png (1200x630), a imagem que aparece quando o link e partilhado
// no WhatsApp, LinkedIn ou Slack. Sem ela, uma pagina cujo proposito e ser partilhada
// aparece sem previsualizacao nenhuma.
//
// Usa o Playwright (ja e devDependency por causa dos e2e) em vez de compor SVG:
// a renderizacao de texto em SVG via sharp depende das fontes do sistema e falha em silencio.
// Correr com: npm run generate:og

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'og.png');

const dataUri = (relativePath, mime) =>
  `data:${mime};base64,${readFileSync(join(root, 'public', relativePath)).toString('base64')}`;

const portrait = dataUri('images/julismo-profile.png', 'image/png');
const wave = dataUri('images/julismo-hero-wave.png', 'image/png');

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  *{box-sizing:border-box;margin:0;}
  html,body{width:1200px;height:630px;}
  body{
    background:#08080a;
    color:#eeeeef;
    font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
    display:grid;
    grid-template-columns:1fr auto;
    align-items:center;
    gap:64px;
    padding:0 96px;
    position:relative;
    overflow:hidden;
    -webkit-font-smoothing:antialiased;
  }
  .wave{
    position:absolute;top:-90px;left:0;width:1200px;opacity:.5;
    mask-image:linear-gradient(to bottom,#000 30%,transparent 100%);
  }
  .copy{position:relative;z-index:1;max-width:640px;}
  h1{font-size:92px;line-height:1;font-weight:660;letter-spacing:-.03em;margin-bottom:24px;}
  p{font-size:31px;line-height:1.35;color:#a8a8b2;font-weight:420;text-wrap:balance;}
  .rule{width:74px;height:3px;background:#e8e8ec;border-radius:2px;margin:34px 0 26px;}
  .tag{
    display:inline-block;font-size:17px;font-weight:640;letter-spacing:.15em;
    text-transform:uppercase;color:#7d7d88;
  }
  .shot{position:relative;z-index:1;}
  .shot img{
    width:340px;height:340px;border-radius:50%;object-fit:cover;
    border:1px solid rgb(255 255 255 / 14%);
    box-shadow:0 40px 90px rgb(0 0 0 / 55%);
  }
</style>
<img class="wave" src="${wave}" alt="">
<div class="copy">
  <span class="tag">Full Stack Developer</span>
  <div class="rule"></div>
  <h1>Julismo</h1>
  <p>Simplifico processos que atrasam a equipa, sem trocar o que já funciona.</p>
</div>
<div class="shot"><img src="${portrait}" alt=""></div>
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const buffer = await page.screenshot({ type: 'png' });
await browser.close();

writeFileSync(out, buffer);
console.log(`og.png escrito: ${buffer.length} bytes (1200x630)`);
