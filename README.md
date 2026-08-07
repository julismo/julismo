# Julismo

Perfil profissional mobile-first de Julismo: uma página direta para contactos, presença digital e referência à ARM Solutions.

## Estado

Em implementação na branch de funcionalidade, com integração prevista em `development`.

## Estrutura de branches

- `main`: versão de produção.
- `development`: integração e preview.
- `feature/*`: trabalho isolado, criado a partir de `development`.

## Documentação

- [Especificação de design](docs/superpowers/specs/2026-08-07-julismo-profile-design.md)
- [PRD](docs/PRD.md)
- [Plano de implementação](docs/superpowers/plans/2026-08-07-julismo-profile-mvp.md)

## Verificação local

```powershell
npm install
npm run check
npm run test
npm run build
npm run generate:qr
```

## QR code

Os ficheiros de impressão são gerados localmente, sem um serviço externo:

- `public/qr/julismo.svg`: QR puro, recomendado quando o cartão já tem o seu próprio design.
- `public/qr/julismo-card.svg`: QR com moldura visual Julismo, sem elementos dentro da zona de leitura.
- `public/qr/julismo.png`: versão raster de alta resolução.

Todos codificam `https://julismo.vercel.app/`. O QR não expira; continua a funcionar enquanto esse URL estiver em produção.
