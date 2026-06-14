# SALOON v5.2 — Cartoon híbrido

Direção final (após feedback): **base visual cartoon do jogo original** (fundo deserto,
painéis brancos com borda vinho #881337, Bebas Neue, botões-pílula simples) **+ as
mecânicas novas aprovadas**. Gameplay 100% preservado.

## O que ficou do redesign anterior
- **A carta de identidade**: arremesso sobre a mesa → "Virar carta" → todas as
  informações DENTRO da carta (descrição, alvo do Delegado, lista de Fora-da-Lei,
  revólver) em blocos `.face-extra` de alto contraste. Naipes por papel:
  ♠ Lei / ♣ Delegado (azul) · ♦ Fora-da-Lei / ♥ Chefe (vermelho).
  Verso neutro (vinho + estrela) — verso colorido por time vazaria a identidade.
- **Confirmação "Você é {nome}?"** antes de qualquer tela secreta.
- **Fichas de poker** na trilha de missões (branca/azul/vermelha, listras na borda)
  e nas rejeições. Números cravados no centro via `.chip-num`.
- **Estrela ★** nos checkboxes de extras e nos itens selecionados.
- **Menu lateral** (gaveta, ícone de leque de cartas, troca de idioma PT 🇧🇷 / EN 🇺🇸).
- **Câmera entre jogadores** (zoom-out + pan) e **i18n completo** (~170 chaves).
- **"Como Jogar" enriquecido** (v5.2): a página principal traz mini-cartas dos dois
  times, a trilha de fichas do objetivo e a rodada passo a passo em trilha numerada
  com ícones SVG, alerta das 5 rejeições e nota das "2 falhas". As regras opcionais
  (Delegado/Chefe e Revólver/Duelo) saíram da página principal e vivem apenas nos
  botões ⓘ da tela de seleção de extras, também enriquecidas. PT e EN.
- Sons novos: `card.wav`, `chip.wav`, `shot.wav` (o `shot.mp3` original não existia).

## O que foi removido/revertido (feedback)
- ✂️ Partículas de poeira — removidas por completo.
- ✂️ "Espiar a carta" (peek) — agora é virar direto.
- ✂️ Tema veludo/couro/dourado, luz de lampião, vinheta de vela — de volta ao
  deserto cartoon (`images/bg.png`) e tipografia original.
- ✂️ Telegrama abaixo da carta — informações migraram para dentro da carta.

## Correções de bugs (incluindo herdados do original)
1. **Som de tiro no duelo revelava a escolha secreta** — removido do momento da
   decisão (offline e online); agora toca apenas na revelação pública do resultado.
2. Texto do Delegado ilegível — agora em faixa clara com texto escuro dentro da carta.
3. Números das fichas descentralizados — span com centralização absoluta.
4. Botão "Virar carta" referenciava nó removido do DOM (clonagem reordenada).
5. `shot.mp3` referenciado mas inexistente — `shot.wav` sintetizado incluído.

## Arquivos
`index.html`, `style.css`, `app.js` (reescritos) · `i18n.js`, `fx.js` (novos) ·
`sounds/card.wav, chip.wav, shot.wav` (novos) · demais assets inalterados.

## Validação
114 verificações automatizadas, 0 falhas:
- smoke_test.js (66): fluxo offline completo com naipes ilustrados, fichas SVG na trilha,
  mesa de decisão (fichas cumprir/sabotar aleatórias) e resultado (fichas arremessadas).
- smoke_test2.js (39): extras, duelo, chefe, fim de jogo.
- online_test.js (9): mesa de decisão e resultado nos contêineres online.

## Integração concluída nesta fase
- Bloco 1: naipes ilustrados (estrela/caveira/delegado/chefe) nas cartas de personagem.
- Bloco 2: fichas oficiais SVG na trilha de missões e rejeições.
- Bloco 3: tela de execução da missão com fichas aleatórias (offline + online).
- Bloco 4: tela de resultado com fichas arremessadas + suspense (offline + online),
  e correção do overlay de vitória (agora brilho nas bordas, sem cobrir o texto).
Sons novos: suspense.wav, thud.wav.
