# Marca Agendia (v3 — violeta editorial, inspirada em template dark)

## Decisão
Dark editorial de alto contraste: preto quase puro + **violeta como única cor
de destaque**, tipografia display condensada gritada, números e rótulos em
mono, cards numerados, faixa-manifesto e footer violeta sólido.

## Paleta
| Token                  | Valor   | Uso                          |
| ---------------------- | ------- | ---------------------------- |
| `--bg`                 | #0A0A0B | Fundo                        |
| `--surface`            | #131316 | Cards, header                |
| `--surface-alt`        | #1C1C21 | Hover, secundários           |
| `--border`             | #2A2A33 | Bordas                       |
| `--brand-primary`      | #A855F7 | CTAs, links, destaques       |
| `--brand-primary-hover`| #9333EA | Hover                        |
| `--brand-accent`       | #C084FC | Detalhes secundários         |
| `--brand-ink`          | #F5F3FF | Texto                        |
| `--text-muted`         | #A1A1AA | Secundário                   |

## Tipografia
- Display: **Anton** (hero, manifesto, wordmark — uppercase, `clamp()` fluido)
- Texto: **Inter** (corpo, formulários)
- Mono: **JetBrains Mono** (badges, stats, códigos, QR)

## Assinatura visual
Hero com headline gigante + stats em fileira + CTAs; cards de evento com
índice mono ("EVENTO 01"); faixa-manifesto central; CTA de cadastro; footer
violeta sólido com links. QR do ingresso mantém fundo branco (scanner).

## Responsivo
Mobile-first: display fluido via `clamp()`, grids `auto-fill/minmax`,
hamburger <900px, tabelas admin com scroll horizontal, formulários e scanner
full-width no mobile. Alvos: 360 / 768 / 1280.
