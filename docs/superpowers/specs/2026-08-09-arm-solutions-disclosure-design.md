# ARM Solutions Disclosure Design

**Date:** 2026-08-09  
**Status:** Approved for implementation by Julismo

## Goal

Turn the ARM Solutions row in the personal profile into a compact, progressively disclosed view of the three most relevant entry solutions for the ARM ICP. It must explain a recognisable operational problem without turning the profile into a full corporate website.

## Research basis

The ICP and Dor-Problema-Solução material identify distribution, wholesalers, transport and logistics businesses with high operational and document volume as the priority audience. The three approved entry points are:

1. Faster quotation handling.
2. Document flow that avoids invoicing blocks.
3. Better control of traffic and daily operations.

The public copy leads with the business outcome rather than internal names such as AI Quote Assistant.

## Information architecture

The existing SOLUÇÕES section remains in the same location after Email and before PRESENÇA.

The ARM row becomes a native disclosure control:

~~~text
ARM Solutions                                      ˅
Para distribuição, transportes e logística

  Orçamentos que chegam a tempo
  Respostas rápidas, com margem protegida.

  Documentos prontos a faturar
  Guias, CMR e POD organizados antes de bloquearem faturação.

  Operação sob controlo
  Prioridades, atrasos e pendências visíveis antes de virarem problemas.

  Conhecer a ARM Solutions ↗
~~~

The three mini-cards are informational. The existing Agendar diagnóstico card remains the primary conversion CTA, so this change does not infer a new WhatsApp or Cal.com route per solution.

## Interaction

- The ARM summary is closed initially.
- Selecting it with mouse, touch, Enter or Space expands native details content.
- The action icon is a rounded down chevron when closed and rotates upward when open.
- The https://arm-lda.com/ destination is preserved as the discreet Conhecer a ARM Solutions link inside the expanded panel.
- No JavaScript is required, so the disclosure also works in the no-JS build.

## Visual design

- Reuse the existing ARM card, icon, dark surface, rounded geometry and silver border.
- Keep the expanded panel inset from the page edges and slightly nested under the parent card.
- Use three compact, readable solution items rather than large CTA cards.
- Motion is limited to the chevron and panel transition; reduced-motion users receive an immediate static state.
- The layout must remain free of horizontal overflow from 280px through desktop.
- On desktop, keep at least 32px of black background after the final GitHub card so the final action never feels clipped against the viewport edge.

## Accessibility

- Use native details and summary semantics rather than a scripted div/button imitation.
- Keep the summary full title and description as its accessible name.
- Keep the external ARM website as a real link with target blank and rel noopener noreferrer.
- Closed disclosure content must not receive keyboard focus; after expansion, the external site link follows the summary in tab order.

## Non-goals

- No per-solution WhatsApp message or new booking destination.
- No video, client logos, screenshots, pricing or unverified case-study claims.
- No new dependency, backend, CMS or JavaScript interaction module.
