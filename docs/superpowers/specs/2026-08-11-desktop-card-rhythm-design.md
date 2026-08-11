# Ritmo dos cartões no desktop

## Decisão

Em larguras a partir de 768 px, a lista de cartões mantém o mesmo intervalo de 8 px já usado no mobile. O espaçamento cria uma cadência consistente entre os contactos, as soluções e a presença digital, sem aumentar o tamanho dos cartões nem alterar a sua hierarquia.

## Limites

- Mantêm-se a largura, a altura mínima, a ordem dos cartões e as margens dos rótulos de secção.
- Mantém-se o respiro lateral mobile e não se introduz qualquer barra de scroll personalizada ou persistente.
- O conteúdo desktop a 1440 por 900 continua a caber no viewport e sem overflow horizontal.

## Validação

Um teste Playwright mede a propriedade `row-gap` e as distâncias reais entre os três primeiros cartões no viewport desktop. A validação também confirma ausência de overflow horizontal e que a composição continua a caber verticalmente.
