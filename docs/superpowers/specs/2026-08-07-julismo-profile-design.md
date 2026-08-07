# Perfil Julismo — especificação de design e entrega

**Data:** 7 de agosto de 2026

**Estado:** pronto para revisão do utilizador

**Projeto local:** `C:\dev\julismo`
**Nome de produto / Vercel:** `julismo`

## 1. Objetivo

Criar uma página pessoal, estática e mobile-first para Julismo. A página deve permitir a uma pessoa que chega por QR code, mensagem ou rede social perceber rapidamente quem é o Julismo e contactar-lhe pelo canal certo.

O resultado não é um portefólio tradicional nem uma cópia do Linktree: é uma apresentação profissional curta, humana e confiante, com prioridade para WhatsApp, email, presença digital e a ligação à ARM Solutions.

## 2. Resultado que define sucesso

- Em cerca de cinco segundos, o visitante vê a fotografia, o nome, a proposta de valor e uma ação de contacto evidente.
- O fluxo está optimizado para ecrãs de 320–430 px, sem comprometer tablets e desktop.
- Cada cartão é uma ação completa e inequívoca; não há menus, passos intermédios, anúncios nem rastreio de terceiros.
- A estética é sóbria: preto, branco, cinzentos e prata, com movimento discreto e funcional.
- O site funciona sem backend, credenciais, cookies necessários ou formulário próprio.

## 3. Público e tom

O público principal é um decisor de uma PME ou alguém que recebeu o contacto do Julismo. Procura clareza, não tecnologia pelo seu próprio valor.

Tom editorial:

- Direto, calmo e específico.
- Centrado em remover atrito operacional sem substituir, de forma irresponsável, o que já funciona.
- Sem promessas vagas sobre IA, linguagem de agência ou superlativos.

Texto de bio aprovado:

> Simplifico processos que atrasam a equipa, sem trocar o que já funciona.

## 4. Escopo do MVP

Incluído:

1. Uma única página estática, bilingue apenas se vier a ser pedido numa fase posterior; o MVP é em português.
2. Fotografia profissional fornecida em `C:\Users\julis\Downloads\unnamed.png`.
3. Cabeçalho com “Julismo”, roseta prateada decorativa e bio aprovada.
4. Cartões de contacto e presença digital.
5. Metadados de SEO/social, favicon e acessibilidade de teclado.
6. QR code SVG local apontado ao URL final de produção.
7. Publicação na conta Vercel pessoal `julismo`, depois de confirmada a produção.

Excluído do MVP:

- Login, painel, CMS, base de dados, formulário próprio, newsletter ou analytics de terceiros.
- Várias páginas, blog, lista extensa de casos de estudo ou carrosséis.
- Interação que force permissões do dispositivo ou movimento excessivo.

## 5. Estrutura e conteúdo da página

Ordem móvel, de cima para baixo:

1. **Hero de perfil** — fotografia circular, nome “Julismo” e roseta prateada de verificação visual. A roseta não comunica certificação de plataforma e não é um botão.
2. **Bio** — “Simplifico processos que atrasam a equipa, sem trocar o que já funciona.”
3. **Links principais** — cartões de largura total, com ícone de marca local, título, texto auxiliar quando acrescenta contexto e uma seta decorativa à direita.
4. **Assinatura discreta** — “Julismo Costa”, usada também nos metadados e no rodapé mínimo.

Links previstos e respetiva prioridade:

| Prioridade | Cartão | Texto auxiliar | Destino |
| --- | --- | --- | --- |
| 1 | WhatsApp | Conversar diretamente | URL WhatsApp confirmado antes de publicar |
| 2 | ARM Solutions | IA e automação para PMEs | `https://arm-lda.com/` |
| 3 | Email | Enviar uma mensagem | endereço confirmado antes de publicar |
| 4 | GitHub | Projetos e código | perfil GitHub confirmado antes de publicar |
| 5 | X | Atualizações e ideias | perfil X confirmado antes de publicar |

Os destinos serão extraídos da página Linktree original ou confirmados pelo Julismo antes da primeira release. Nenhum contacto será inventado.

## 6. Sistema visual aprovado

### Direção

Fundo preto mate com profundidade muito subtil, superfícies antracite, texto branco suave, texto secundário cinzento e detalhes prata. O visual deve parecer editorial e pessoal, não uma interface genérica gerada por IA.

### Tokens iniciais

| Elemento | Valor de referência |
| --- | --- |
| Fundo | `#0A0A0B` a `#111113` |
| Superfície de cartão | `#161618` / `#1B1B1E` |
| Linha | branco a 12–18% de opacidade |
| Texto principal | `#F5F5F4` |
| Texto secundário | `#A1A1AA` |
| Prata / roseta | gradiente de `#F4F4F5` para `#A1A1AA` |
| Raio dos cartões | 14–15 px |
| Área tocável | mínimo de 52 px de altura |
| Largura de conteúdo | até 440 px, centrada |

### Ícones e cartões

- Os ícones de WhatsApp, ARM, Email, GitHub e X serão SVG locais; não serão carregados de um CDN em produção.
- Ícones de marca serão monocromáticos, dentro de um anel/superfície coerente com os cartões.
- Cada cartão inteiro é um único link. A seta é visual (`aria-hidden`) e nunca um botão dentro de outro elemento interativo.
- Estados de hover, foco e pressionar são discretos: pequena elevação/contraste, sem alterar a hierarquia nem criar brilho excessivo.

## 7. Movimento e interação

O movimento é melhoria progressiva; a página continua integralmente utilizável sem JavaScript, sensores ou animações.

### Faixa animada do WhatsApp

- Apenas o cartão WhatsApp tem uma faixa/contorno prateado em movimento lento (cerca de 8–9 s).
- A animação é contínua, suave e de baixo contraste, para distinguir o canal prioritário sem competir com o conteúdo.
- Quando `prefers-reduced-motion: reduce` está ativo, a faixa fica estática.

### Inclinação por giroscópio

- Implementação nativa com `DeviceOrientationEvent`, `requestAnimationFrame` e `transform`; não será adicionada uma biblioteca de animação pesada.
- O plano de conteúdo completo inclina ligeiramente, nunca cada cartão de forma independente.
- O valor inicial é calibrado como neutro; há zona morta, suavização e limites aproximados de ±1,5 graus e ±3 px para impedir movimentos bruscos.
- O efeito pausa quando a página está oculta e fica desligado para preferência de movimento reduzido.
- Em navegadores que disponibilizam o sensor sem autorização adicional, ativa-se automaticamente. No iOS/Safari que exige um gesto explícito para conceder permissão, o site mantém-se estático: não haverá um falso “botão de profundidade” nem pedidos intrusivos de permissão.

### Princípios de segurança de interação

- Respeitar `prefers-reduced-motion`.
- Não usar partículas, vídeo de fundo, scroll parallax, neon ou transições que atrasem a ação principal.
- Todas as ações externas têm foco visível e `rel="noopener noreferrer"` quando abrem numa nova aba.

## 8. Arquitetura técnica

### Base

- **Astro** estático, com TypeScript e npm.
- CSS próprio com variáveis/tokens; sem dependência de uma framework de componentes pesada.
- JavaScript mínimo e isolado apenas para a melhoria de movimento.
- Ativos locais e otimizados; imagem de perfil convertida/gerada nos tamanhos adequados durante o build.

### Estrutura prevista

```text
src/
  components/
    ProfileHero.astro
    LinkCard.astro
    VerifiedRosette.astro
  data/
    profile.ts
  layouts/
    BaseLayout.astro
  pages/
    index.astro
  scripts/
    motion.ts
  styles/
    tokens.css
    global.css
public/
  icons/
  qr/
  favicon.svg
tests/
  unit/
  e2e/
```

### Dados e validação

`src/data/profile.ts` será a fonte única para nome, bio, links, rótulos, ordem e metadados. Uma validação de build verificará que cada ligação tem título, URL HTTPS ou esquema permitido (`mailto:` / `https:`), e texto acessível. Falhas de configuração interrompem o build, em vez de gerar cartões incompletos.

### SEO e privacidade

- `title`, descrição, Open Graph, cartão social, `canonical` e `robots` serão definidos no layout base.
- O nome público é **Julismo**; `Julismo Costa` é usado na assinatura e em metadados adequados.
- Não haverá secret, chave de API, pixel, cookie funcional ou envio de dados pelo site no MVP.
- A URL canónica só será fixada após o domínio de produção estar ligado.

## 9. Git e entrega

Estratégia aprovada:

- `main`: produção e origem dos deployments de produção.
- `development`: integração, preview e origem do trabalho inicial.
- `feature/*`: criada a partir de `development`, regressa através de revisão antes de integrar.
- O primeiro commit contém apenas documentação e convenções. A implementação começa em `development` após a revisão desta especificação.

Repositório remoto proposto: `julismo` na conta GitHub `julismo`. Por segurança, será criado privado até o Julismo confirmar expressamente que o código deve ser público; esta opção não muda o funcionamento do site.

## 10. Vercel e domínio

- A conta de deployment é a conta pessoal Vercel **`julismo`**, autenticada por GitHub. Não será usada qualquer conta ou equipa Trion.
- O projeto Vercel será `julismo`, ligado ao repositório pessoal depois de existir.
- `main` publica em produção; `development` gera previews automáticos.
- O primeiro domínio a tentar ligar é `julismo.vercel.app`.
- A disponibilidade de um subdomínio Vercel só fica decidida quando o projeto de produção o reclama. Se já estiver ocupado, a alternativa proposta é `julismocosta.vercel.app`, a usar apenas com confirmação do Julismo.
- Só depois de o URL de produção responder corretamente será gerado e incluído o QR code SVG estático, sem anúncios, expiração ou serviço externo.

## 11. Validação

Antes de cada integração relevante:

1. `npm run check` para tipos e validação Astro.
2. Testes unitários para a validação dos dados e o cálculo limitado da inclinação.
3. Testes Playwright em 320 px, 390 px e 768 px: conteúdo visível, cartões clicáveis, navegação por teclado, foco e layout sem overflow horizontal.
4. Verificação visual por screenshot em mobile e desktop, incluindo estado de movimento reduzido.
5. Depois do deployment, smoke test de produção, metadados, links externos e QR code.

Critérios de aceitação:

- Nenhum cartão fica cortado ou obriga a scroll horizontal em 320 px.
- O WhatsApp é a ação visual mais clara, sem transformar os restantes cartões em ações secundárias difíceis de encontrar.
- A página pode ser operada inteiramente por teclado e lida de forma compreensível por leitor de ecrã.
- O efeito de movimento nunca é necessário para compreender ou usar o site.
- A página publicada usa a conta Vercel pessoal do Julismo e o QR code aponta para a URL final real.

## 12. Riscos conhecidos e resposta

| Risco | Resposta definida |
| --- | --- |
| `julismo.vercel.app` estar ocupado | validar no deployment; pedir autorização antes de usar `julismocosta.vercel.app` |
| iOS exigir autorização para o giroscópio | fallback estático sem pedir permissão de forma intrusiva |
| Contactos antigos/incompletos | confirmar URL antes de escrever a configuração de produção |
| Animação comprometer conforto/acessibilidade | limites baixos, pausa em aba oculta e suporte a redução de movimento |
| Alterações diretas em produção | fluxo `feature/*` → `development` → `main`, com validação antes de publicar |

## 13. Referências que orientam a decisão

- Perfil atual: `https://linktr.ee/julismocosta`.
- ARM Solutions: `https://arm-lda.com/`.
- Padrões técnicos do browser: `DeviceOrientationEvent`, `requestAnimationFrame`, CSS `transform` e `prefers-reduced-motion`.
- Padrões de cartões de ação: alvo inteiro clicável, uma ação por cartão, ícones auxiliares e foco visível.
