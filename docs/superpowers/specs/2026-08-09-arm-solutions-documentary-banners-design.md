# ARM Solutions — banners documentais

**Estado:** direcção aprovada para implementação
**Data:** 2026-08-09

## Objectivo

Substituir as três artes geométricas actuais por imagens horizontais que façam um decisor de distribuição, transportes ou logística reconhecer trabalho real: preparar uma resposta comercial, validar documentação e coordenar uma operação.

O resultado deve parecer editorial e profissional, não uma ilustração de produto, um dashboard, uma fotografia de banco de imagens ou uma composição de IA.

## Enquadramento no perfil

Os banners aparecem apenas dentro da divulgação expansível da ARM Solutions. A imagem é decorativa; o título e a descrição continuam em HTML por cima do seu gradiente inferior. A página permanece essencialmente escura e limpa, mas a fotografia pode ter cor controlada para dar contexto humano e operacional.

O rascunho local `2026-08-09-arm-banner-art-brief.md` é uma proposta do Claude com laranja dominante e ilustrações geométricas. Não é a fonte de verdade desta versão e não deve ser incluído sem revisão explícita.

## Direcção visual

- Fotografia documental contemporânea: pessoas a trabalhar, não a posar para a câmara.
- Luz natural ou prática, em grafite, aço/azul discreto e tons quentes moderados. Cor serve a cena; não é uma faixa de marca nem um neon.
- Nada de texto, números legíveis, logos, uniformes de marcas, ecrãs legíveis, matrículas, dados de clientes ou marcas de água.
- O terço inferior esquerdo mantém-se escuro e pouco detalhado para que a copy HTML seja sempre legível.
- O ponto de interesse fica entre o centro e a direita; evitar cortar rostos, mãos ou documentos importantes quando a imagem é apresentada a `object-fit: cover`.
- Profundidade de campo moderada, grão fino e contraste baixo-médio. Sem filtros cinzentos pesados: a cor deve continuar humana, equilibrada e coerente com o fundo preto.

## As três cenas

### `quotes.webp` — Orçamentos que chegam a tempo

Uma profissional ou um profissional de operações, visto de perfil ou de costas, a preparar uma proposta num posto de trabalho real. Um ambiente de expedição ou transporte fica subtilmente desfocado ao fundo. Um monitor pode existir, mas não exibe dados legíveis. A cena comunica rapidez de resposta e margem protegida, sem transformar a imagem numa tabela ou num dashboard.

### `documents.webp` — Documentos prontos a faturar

Plano documental de mãos reais a organizar guias, CMR ou POD junto de um portátil/tablet neutro. Os papéis têm estrutura credível, mas nenhum texto pode ser lido. Há uma pessoa presente pela acção das mãos e pelo enquadramento, sem necessidade de mostrar um rosto. A cena comunica validação cuidada antes da faturação.

### `operations.webp` — Operação sob controlo

Pequena equipa de duas ou três pessoas a coordenar uma expedição numa zona de armazém, cais ou sala de controlo operacional. A atitude é concentrada e espontânea, sem reunião encenada, aperto de mão ou pose corporativa. Caixas, veículos ou uma doca podem aparecer desfocados e sem marcas. A cena transmite visibilidade e decisão atempada.

## Contrato técnico

| Item | Regra |
| --- | --- |
| Formato | WebP estático, sem texto incorporado |
| Tamanho | 1176 × 504 px (21:9), para evitar ampliar os antigos quadrados de 256 px |
| Peso | até 100 KB por arte; até 300 KB no conjunto |
| Caminhos | `public/images/arm-solutions/{quotes,documents,operations}.webp` |
| Carregamento | local, `loading="lazy"`, decorativo (`alt=""`, `aria-hidden="true"`) |
| Crop | sem detalhe essencial nos 15% exteriores e sem informação importante no terço inferior esquerdo |

## Interacção e acessibilidade

- A divulgação nativa ARM continua fechada por defeito e abre dentro do mesmo cartão.
- O carrossel não roda sozinho. O leitor controla-o pelos três chips e pelos indicadores.
- Se forem mantidos papéis ARIA de separadores, cada controlo tem de apontar para um painel com `id` real; setas Home/End devem seguir o padrão de tabs. Caso contrário, usar botões simples sem a semântica de tabs incompleta.
- Respeitar `prefers-reduced-motion` e não introduzir movimento obrigatório.

## Critérios de aceitação

1. Cada banner comunica uma situação humana de logística distinta em menos de dois segundos.
2. A copy inferior mantém contraste confortável em mobile (390 px) e desktop (1440 px).
3. Não há aparência de cartão abstracto, diagrama técnico, stock photo posada ou imagem com texto gerado.
4. A divulgação não cria overflow horizontal entre 280 px e 1440 px.
5. Os controlos de solução são accionáveis por teclado e semanticamente consistentes.
6. A verificação inclui imagens reais em Playwright, `npm run check`, testes unitários, E2E e build.
