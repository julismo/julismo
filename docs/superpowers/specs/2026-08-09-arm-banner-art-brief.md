# Brief das 3 artes do carrossel ARM

Substitui o brief anterior de `2026-08-09-arm-solutions-imagery-design.md`, que produziu três quadrados de 256×256 sem assunto. Decisões tomadas com o Julismo a 2026-08-09.

## Contrato técnico

| | Valor |
|---|---|
| Formato | WebP |
| Dimensão | 1176 × 504 (21:9, 2× do render de ~588 px) |
| Destino | `public/images/arm-solutions/{quotes,documents,operations}.webp` |
| Peso | ≤ 45 KB cada, ≤ 135 KB no total |
| Fundo | Sangra de bordo a bordo. **Sem moldura preta**, sem motivo isolado ao centro |
| Texto | **Nenhum texto na arte.** O título e a descrição são HTML por cima, para mudar copy sem regerar |

## Cor

`#E8590C`, o laranja da ARM. Fonte: preset `'ARM Laranja'` em `arm-ops-ai/DemoTrans/demotrans_app.html`.

Estes banners são **o único ponto de cor de toda a página**: o resto do perfil é monocromático, sem um único acento. Por isso o laranja entra como luz e acento, não como área chapada. Regras:

- Ground quase preto, na família de `#0b0b0d` a `#16161a`, para assentar no cartão.
- O laranja não deve passar de ~15% da área. Usar em arestas iluminadas, num traço, num ponto de foco.
- Baixar a saturação face ao `#E8590C` puro quando a área for grande. Sobre preto, o laranja puro em massa berra e rouba atenção ao retrato que está imediatamente acima na página.

## Composição

O texto assenta em baixo, sobre um gradiente escuro que ocupa os ~45% inferiores. Logo:

- **Terço inferior esquerdo tem de ficar calmo.** Nada de detalhe importante aí: fica tapado.
- A leitura é **horizontal**. Um motivo centrado num 21:9 perde-se. Pensar em linha de horizonte, perfil, percurso.
- O ponto de interesse cai no terço direito ou no meio-alto.

## Os três assuntos

O ICP da ARM são empresas B2B que movem mercadoria: distribuição, grossistas, transportadoras rodoviárias, operadores logísticos e last-mile. Alto volume documental, guias, CMR, POD. As artes têm de dizer isso, nem que seja de forma estilizada.

### 1. `quotes.webp` — Orçamentos que chegam a tempo
Um pedido de orçamento a ser respondido depressa. Sugestão: linhas de uma tabela de preços em perspetiva, com a linha do total acesa a laranja, e um traço de progresso que atravessa a composição da esquerda para a direita. A ideia a transmitir é resposta rápida com a margem visível.

### 2. `documents.webp` — Documentos prontos a faturar
Uma pilha de guias e CMR, em perspetiva ligeira, vistas de lado como um maço de papel. Um dos documentos destacado com aresta laranja, como se tivesse sido validado. Nada de ícone de "check" genérico.

### 3. `operations.webp` — Operação sob controlo
Um percurso: linha horizontal com paragens marcadas, uma delas acesa a laranja, sugerindo o ponto que precisa de atenção. Alternativa: silhueta de doca com veículos alinhados vista de topo. O que interessa é a ideia de acompanhar uma operação inteira de relance.

## Coerência entre as três

Mesma linguagem, mesma direção de luz, mesma densidade. Vistas em sequência de 8 em 8 segundos, três estilos diferentes leem-se como erro.

## Como foram produzidas

Duas tentativas, e a segunda é a que ficou.

1. **SVG desenhado por código**, convertido para WebP com `sharp`. Ilustração geométrica: tabela em perspetiva, maço de guias, percurso com paragens. Melhor do que as texturas abstratas que vieram antes, porque pelo menos tinham assunto, mas continuavam a ser desenho vetorial num sítio que pedia fotografia. Os ficheiros saíam com 6 a 9 KB, o que num 1176×504 denuncia arte quase vazia.

2. **Fotografia documental**, que é o que está em produção. As fontes vivem em `.superpowers/arm-banner-sources/*.png` e o `scripts/generate-arm-banners.mjs` recorta-as para 1176×504 e converte para WebP. Cada uma tem entre 24 e 28 KB.

O piso de 12 KB por ficheiro ficou no gerador e no teste unitário precisamente por causa da tentativa 1: obriga a haver conteúdo real na moldura e falha se alguém voltar a produzir arte lisa. Subir a qualidade do WebP para passar o número seria fazer batota, e a mensagem de erro do gerador diz isso.

**As fontes PNG não vão para o repositório**: `.superpowers/` está no `.git/info/exclude`. Quem clonar o repo tem os WebP finais mas não consegue voltar a correr `npm run generate:banners` sem elas. Se isso passar a incomodar, o sítio das fontes tem de mudar.

## Fotografia real da ARM

O Julismo confirmou ter fotografias reais. Quando aparecerem, entram como fontes novas nos mesmos caminhos, com o mesmo recorte 21:9, e nenhum código muda. Continuam a ser preferíveis: as atuais são convincentes, mas as pessoas que aparecem nelas não são a equipa da ARM, e num site que apresenta a ARM a clientes essa distinção interessa.
