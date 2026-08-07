# Perfil GitHub pessoal do Julismo — desenho de alteração

**Data:** 7 de agosto de 2026  
**Estado:** aprovado para revisão de especificação  
**Âmbito:** apresentação pública no GitHub, não o site publicado nem os seus links de contacto.

## Objetivo

Fazer do perfil `julismo` uma apresentação exclusivamente pessoal de developer. O perfil não deve mencionar, promover ou identificar qualquer empresa.

## Decisão aprovada

1. Remover o campo de empresa do perfil GitHub.
2. Substituir o `README.md` de perfil por uma apresentação concisa em inglês, focada em Julismo como developer, trabalho técnico e contacto via GitHub.
3. Remover menções a ARM Solutions, Trion Scale e `Trion-Site` do README de perfil.
4. Manter somente `document-ops-workbench` fixado no perfil.
5. Manter a bio pessoal existente: `Building reliable AI-assisted operations software.`

## Conteúdo do README

O README conterá apenas:

- nome e proposta pessoal de developer;
- três áreas técnicas: operações de documentos, workflows de IA fiáveis e software TypeScript prático;
- uma ligação ao `document-ops-workbench`;
- uma ligação de contacto para abrir uma issue no GitHub.

Não conterá empresas, processos internos, estado de branches, documentação de implementação, QR codes ou instruções de verificação local.

## Fora de âmbito

- Código, deployment e links do site pessoal `julismo`;
- repositórios de organizações ou configurações de organizações;
- rotação de credenciais e a visibilidade de `Pricing-Money-Masters`;
- histórico existente do repositório.

## Implementação e verificação

1. Editar apenas `README.md` no ramo `profile/personal-only`.
2. Validar que o ficheiro não contém `ARM`, `Trion` ou referências empresariais.
3. Executar `npm run check`, `npm run test:unit` e `npm run test:e2e`.
4. Criar e integrar uma PR para `main`.
5. Pela interface autenticada do GitHub, limpar o campo de empresa e remover `Trion-Site` dos pins.
6. Verificar a página pública sem sessão: README pessoal, um pin de projeto e nenhuma empresa apresentada no perfil.
