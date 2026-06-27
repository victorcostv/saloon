# Saloon — com Modo Party + QR Code

Saloon completo (offline + online) com o Modo Party integrado.

## Modos de jogo
- **Offline (Pass & Play)**: um aparelho, passa de mão em mão. Sem cronômetro.
- **Online normal**: cada jogador no seu celular. Sem cronômetro.
- **Modo Party**: ligado nas configurações da sala online. Quem liga vira a "tela"
  (TV/notebook) e mostra o tabuleiro para todos; os jogadores usam o celular como controle.

## Modo Party
- No lobby da sala online, o host vê o card "Modo Party". Ao ligar, este aparelho vira a tela.
- A tela mostra: trilha, votação (cronômetro 1 min, auto-aprova), missão (suspense),
  resultados, duelo, fim de jogo (papéis revelados) e adivinhação do Chefe.
- Cronômetros (só no Party): votação 1 min (auto-aprova), Xerife 1min30 (passa a vez).
- A tela é o "juiz": conta votos, processa missões e avança o jogo.

## QR Code / Link de sala
- No Modo Party, a tela mostra um QR code no lobby.
- Escanear (ou abrir saloongame.com.br/#CODIGO) entra direto na sala.
- Funciona para qualquer sala online (com ou sem Party).

## Luzes inteligentes (Tuya)
- laranja = neutro, azul = Lei/sucesso, vermelho = Fora-da-Lei/sabotagem.

## Estrutura
- index.html, app.js (motor + online), screen.js (modo Party), art.js, fx.js,
  i18n.js, style.css, qrcode.js (gerador de QR offline)
- tests/ — 129 verificações do motor
