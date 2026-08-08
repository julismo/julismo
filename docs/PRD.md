# PRD — Perfil profissional Julismo

**Versão:** 1.0

**Data:** 7 de agosto de 2026

**Estado:** execução autorizada até produção

**Responsável pelo produto:** Julismo Costa
**Repositório / projeto Vercel:** `julismo`

Este documento é a referência operacional da entrega. Se existir conflito entre uma decisão posterior e este PRD, prevalece a decisão posterior explícita do Julismo.

## 1. Problema a resolver

O perfil atual concentra links úteis, mas não comunica de imediato a proposta profissional nem conduz com clareza ao contacto certo. Uma pessoa que recebe o link precisa de perceber rapidamente quem é o Julismo, porque poderá falar com ele e como iniciar essa conversa.

## 2. Objetivo do produto

Publicar um perfil pessoal de uma página, premium sem ser ostensivo, com foco em telemóvel. Deve transformar visitas vindas de QR code, WhatsApp, networking ou redes sociais em contactos diretos, sem formulários, anúncios ou ruído.

## 3. Objetivos mensuráveis de lançamento

| Objetivo | Critério verificável |
| --- | --- |
| Clareza imediata | Fotografia, nome, bio e CTA WhatsApp são visíveis no primeiro ecrã de 390 px quando possível; se a altura variar, aparecem antes de qualquer conteúdo secundário. |
| Contacto simples | WhatsApp, email e outros destinos abrem o URL correto a partir de um cartão inteiro clicável. |
| Excelência móvel | Não existe overflow horizontal nem alvo tocável inferior a 52 px nos viewports de 320 px e 390 px. |
| Acessibilidade | Estrutura semântica, foco de teclado visível, contraste adequado e respeito por `prefers-reduced-motion`. |
| Produção real | Deployment em conta Vercel pessoal `julismo`, domínio de produção funcional e QR code que aponta para esse domínio. |
| Qualidade verificável | Check de tipos/build, testes automatizados, testes de browser e smoke test de produção passam antes da entrega. |

## 4. Não-objetivos

- Não criar uma plataforma Linktree, CMS ou sistema de administração.
- Não incluir login, base de dados, API própria, formulário, newsletter ou recolha de leads no MVP.
- Não usar uma estética neon, “glassmorphism”, partículas, vídeo, carrosséis ou efeitos que pareçam um template de IA.
- Não alegar afiliação, cargo ou certificação que não esteja confirmada.
- Não adicionar contactos, URLs ou redes que não sejam validados.

## 5. Utilizadores e jornada principal

### Pessoa que recebeu o link

1. Abre o link no telemóvel ou lê o QR code.
2. Vê o retrato, “Julismo” e a bio antes de decidir se existe relevância.
3. Escolhe WhatsApp para conversar, ou um cartão alternativo para confirmar contexto/contactar por outro canal.
4. Sai para o destino escolhido; o perfil não cria um passo intermédio.

### Decisor de PME

O tom deve transmitir que o Julismo entende operações que já existem e quer melhorar o gargalo concreto de forma pragmática. Evitar explicar tecnologia antes da dor; não prometer uma transformação genérica.

## 6. Conteúdo aprovado

### Identidade

- Nome apresentado: **Julismo**.
- Nome completo de apoio/SEO: **Julismo Costa**.
- Fotografia: retrato profissional fornecido pelo utilizador.
- Selo visual: roseta prateada refinada, apenas decorativa e alinhada ao nome. Não deve parecer botão nem conter o texto “perfil original”.

### Bio

> Simplifico processos que atrasam a equipa, sem trocar o que já funciona.

### Cartões, ordem e microcopy

| Ordem | Título | Texto auxiliar | Tipo de destino |
| --- | --- | --- | --- |
| 1 | Falar comigo | WhatsApp · resposta direta | `https://api.whatsapp.com/send?phone=351933751885` |
| 2 | ARM Solutions | IA e automação para PMEs | `https://arm-lda.com/` |
| 3 | Email | Escreve-me diretamente | `mailto:julismocosta@gmail.com` |
| 4 | GitHub | Código e projetos open source | `https://github.com/julismo` |
| 5 | LinkedIn | Perfil profissional | `https://www.linkedin.com/in/julismocosta/` |

Fonte de validação dos destinos pessoais: página atual `https://linktr.ee/julismocosta`, verificada em 7 de agosto de 2026, e URL de LinkedIn confirmada pelo proprietário em 8 de agosto de 2026.

## 7. Requisitos funcionais

### RF-01 — Página única

O site renderiza uma página principal em `/`, inteiramente estática e funcional sem JavaScript.

### RF-02 — Perfil e hierarquia

A página exibe imagem com `alt` apropriado, heading principal “Julismo”, roseta decorativa ignorada por leitor de ecrã e bio aprovada.

### RF-03 — Cartões de ligação

Cada destino é um elemento `<a>` completo, com nome acessível e URL válido. A seta é decorativa. Links externos em nova aba usam `target="_blank"` e `rel="noopener noreferrer"`; links `mailto:` e de WhatsApp podem manter o comportamento que melhor reduza atrito no browser móvel.

### RF-04 — Ícones locais

Os ícones de marca e ação são SVG incluídos no repositório. A primeira versão não depende de CDN de ícones, fontes de ícones ou scripts de terceiros.

### RF-05 — Destaque WhatsApp

O cartão WhatsApp é o CTA visual prioritário e tem uma faixa de contorno prata com movimento lento. Essa faixa não altera o tamanho do cartão, não pisca e permanece estática quando a preferência de movimento reduzido está ativa.

### RF-06 — Movimento por orientação

Em dispositivos que expõem orientação sem autorização adicional, o contentor visual pode inclinar-se levemente em resposta ao dispositivo. A implementação deve:

- usar apenas APIs nativas e `requestAnimationFrame`;
- considerar o primeiro valor válido como base de calibração;
- aplicar zona morta, interpolação e limites de segurança;
- afetar o conjunto, nunca cartões individualmente;
- parar quando o documento fica oculto;
- não executar com `prefers-reduced-motion: reduce`;
- degradar para estado estático em plataformas que exigem consentimento explícito de sensor, sem tentar contornar a permissão.

### RF-07 — QR code

Após confirmação do deployment de produção, gerar QR code SVG local que codifica o URL HTTPS final. O QR code não pode depender de uma imagem, API ou página publicitária de terceiros; deve ser verificável por leitura/decodificação automatizada ou inspeção do payload.

### RF-08 — Metadados

Definir título, descrição, Open Graph, `twitter:card`, favicon, canonical e metadados de idioma. A canonical corresponde exclusivamente ao domínio final de produção.

### RF-09 — Conformidade com o utilizador

O conteúdo não recolhe dados, não usa pixels de marketing e não pede permissões irrelevantes. A política de privacidade não é necessária no MVP porque não existe processamento próprio de dados; caso se adicione analytics/formulário no futuro, esta decisão deve ser reavaliada.

## 8. Requisitos de experiência e design

### Visual

- Fundo preto mate com variação quase impercetível; superfícies antracite, texto branco e cinzentos, acentos prata.
- Um layout editorial compacto, vertical e centrado, limitado a cerca de 440 px de conteúdo.
- Cartões com raio 14–15 px, borda subtil e altura mínima de 52 px.
- Fotografias e ícones mantêm nitidez em ecrãs retina.
- Não introduzir texto/elemento de “profundidade”, toggle de animações ou medalha que pareça um controlo.

### Responsividade

| Viewport | Comportamento obrigatório |
| --- | --- |
| 320 px | Sem overflow horizontal, espaçamentos ainda legíveis, alvos tocáveis preservados. |
| 390 px | Composição de referência; hero e CTA prioritário dominam sem parecer comprimidos. |
| 768 px | Coluna permanece intencionalmente estreita e centrada, sem aparência de app esticada. |
| 1280 px+ | Fundo ganha respiro; conteúdo mantém foco e não cresce indevidamente. |

### Acessibilidade

- HTML semântico (`main`, heading coerente, lista/agrupamento apropriado de links).
- Todos os controlos utilizáveis por teclado e com indicador de foco visível.
- Contraste de texto e limites visuais adequados para o fundo escuro.
- Imagem, ícones e roseta recebem semântica correta (decorativos escondidos de leitor de ecrã quando aplicável).
- `prefers-reduced-motion` desativa ou fixa todas as animações relevantes.

## 9. Arquitetura e tecnologia

### Escolha

Astro estático, TypeScript, npm, CSS próprio e JavaScript mínimo para melhoria progressiva. Esta combinação produz uma página rápida, simples de manter e sem custos/risco de backend para o objetivo atual.

### Organização prevista

```text
src/
  components/
    LinkCard.astro
    ProfileHero.astro
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
    global.css
    tokens.css
public/
  icons/
  qr/
  favicon.svg
tests/
  e2e/
  unit/
```

### Fonte única de dados

`src/data/profile.ts` centraliza nome, bio, metadados e links. A camada de dados é validada durante o build para impedir links vazios, destinos não permitidos ou rótulos ausentes. Os únicos esquemas permitidos são `https:` e `mailto:`; o URL de WhatsApp deve ser `https:`.

### Dependências

- Produção: Astro e as dependências exigidas pelo seu build.
- Desenvolvimento: TypeScript/Astro check, Vitest para funções puras e Playwright para browser.
- Evitar bibliotecas de animação e pacotes visuais que substituam a linguagem definida neste PRD.

## 10. Segurança, desempenho e privacidade

- Sem secrets ou valores de ambiente necessários ao runtime.
- `.env*` ignorado por Git, com exceção eventual de `.env.example` sem valores privados.
- Sem HTML injetado de fontes externas e sem dependência de analytics no lançamento.
- Imagem e SVGs otimizados; JavaScript deferido e limitado à orientação.
- Objetivo de página leve: evitar fontes remotas bloqueantes, bibliotecas grandes e imagens maiores do que o necessário.
- Cabeçalhos e comportamento do hosting seguem a configuração padrão segura da Vercel, com configuração adicional apenas se tiver valor comprovado.

## 11. Estratégia Git, GitHub e Vercel

### Repositório

- Diretório local: `C:\dev\julismo`.
- Repositório remoto: `julismo` na conta GitHub `julismo`.
- Visibilidade inicial: privada, por ser a opção reversível e segura quando não foi dada uma instrução explícita de publicação do código. Pode tornar-se pública depois sem alterar deployment.

### Branches

- `main`: produção.
- `development`: integração e preview.
- `feature/*`: criada a partir de `development` para alterações isoladas.
- Fluxo: `feature/*` → `development` → `main`; antes de cada merge são executadas as verificações definidas neste PRD.

### Vercel

- Conta: pessoal `julismo`, autenticada por GitHub; nunca uma conta/equipa Trion.
- Projeto: `julismo`.
- Produção: branch `main`.
- Preview: `development` e branches de funcionalidade.
- Domínio prioritário: `julismo.vercel.app`.
- Fallback: `julismocosta.vercel.app`, apenas se o prioritário não puder ser associado e for necessário concluir o lançamento.

## 12. Plano de testes

### Testes estáticos e unitários

- `npm run check`: tipos, componentes e build Astro.
- Validação de dados: cada cartão tem ID único, rótulo, URL permitido e descrição coerente.
- Movimento: zona morta, limites e interpolação são testados como funções puras; nenhuma entrada pode produzir rotação acima do limite definido.

### Testes de browser

- Playwright em 320 × 720, 390 × 844, 768 × 1024 e desktop.
- Validar renderização, ausência de overflow, leitura do heading/bio, ordem e destinos dos links.
- Validar tecla Tab, Enter e foco visível em todos os cartões.
- Emular `prefers-reduced-motion` e confirmar que a animação e inclinação não são aplicadas.
- Capturar screenshots de referência em mobile e desktop para inspeção visual.

### Testes de produção

- Abrir URL de produção e confirmar HTTP 200/HTML esperado.
- Validar metadados, canonical e preview social básico.
- Percorrer todos os destinos sem expor/seguir informação privada no relatório.
- Ler o payload do SVG QR ou descodificá-lo para confirmar o URL de produção.
- Repetir a verificação visual na Vercel, não apenas no ambiente local.

## 13. Definition of Done da /goal

A /goal só fica concluída quando todos os itens seguintes estiverem verdadeiros:

- [ ] Repositório local criado em `C:\dev\julismo` com commits intencionais.
- [ ] Repositório GitHub pessoal criado e ligado como `origin`.
- [ ] Branches `main` e `development` existem no remoto e seguem o fluxo definido.
- [ ] Aplicação Astro implementada a partir do design aprovado, sem recriar uma linguagem visual diferente.
- [ ] Fotografia profissional é usada de forma otimizada e acessível.
- [ ] Bio aprovada e cartões finais estão corretos, com destinos confirmados.
- [ ] Ícones finais são locais e visualmente coerentes com o sistema preto/branco/cinzento.
- [ ] Roseta prateada, faixa WhatsApp e inclinação progressiva estão implementadas dentro dos limites de conforto definidos.
- [ ] Modo de redução de movimento é validado.
- [ ] `check`, testes unitários e Playwright passam.
- [ ] Screenshots mobile e desktop foram revistos.
- [ ] Projeto Vercel pessoal está ligado, com production branch `main` e preview em `development`.
- [ ] `julismo.vercel.app` está em produção, ou o fallback definido está funcional quando o domínio prioritário for comprovadamente indisponível.
- [ ] QR code SVG sem anúncios/expiração aponta para a URL de produção correta.
- [ ] Smoke test de produção passou e o resultado final é comunicado ao Julismo com links relevantes.

## 14. Gestão de bloqueios

O trabalho avança sem checkpoints desnecessários. Só é necessária uma ação do Julismo quando ocorrer um bloqueio não solucionável de forma segura pelo agente, como:

1. uma nova autenticação na conta pessoal GitHub ou Vercel;
2. o domínio prioritário e o fallback estarem indisponíveis;
3. uma conta externa exigir aceitação de termos/2FA que apenas o titular pode concluir;
4. um contacto essencial não puder ser confirmado sem risco de publicar destino errado.

Fora desses casos, este PRD autoriza a execução completa até produção e validação final.
