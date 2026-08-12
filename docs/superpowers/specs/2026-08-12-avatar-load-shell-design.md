# Base opaca e carregamento do retrato

## Problema observado

O retrato circular atravessa o limite inferior do banner. Durante o primeiro desenho, o elemento da fotografia não tem fundo CSS; antes de a imagem ser desenhada, as linhas do banner ficam visíveis no interior do círculo e criam uma transição visual estranha.

## Decisão

1. A própria imagem do retrato recebe uma base circular opaca `var(--color-bg)`.
2. O anel subtil e a sombra existentes mantêm-se por cima dessa base.
3. O documento pré-carrega `/images/julismo-profile.png` como imagem, enquanto o `img` continua com `loading="eager"` e dimensões explícitas.

## Limites

- Não há troca, edição ou conversão do ficheiro de fotografia.
- Não se altera o banner, a composição, o tamanho do avatar, acessibilidade, hierarquia ou animações.
- Não é introduzida uma animação/fade artificial: a fotografia aparece assim que fica disponível; antes disso vê-se uma superfície intencionalmente escura e estável.

## Critérios de aceitação

- A `.profile-hero__image` tem fundo opaco igual ao `--color-bg` e continua circular.
- O `<head>` inclui exactamente um preload com `rel="preload"`, `as="image"` e `href="/images/julismo-profile.png"`.
- A imagem mantém `loading="eager"`, `decoding="async"`, dimensões 156 por 156 e texto alternativo existente.
- A geometria de sobreposição avatar/banner mantém-se nos viewports testados.
- Uma navegação com cache desactivada no Playwright mostra a base opaca antes do evento `load` e a fotografia completa depois dele.
