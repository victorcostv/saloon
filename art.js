// ════════════════════════════════════════════════════════════
// SALOON — art.js : naipes e fichas em SVG (gerados nesta arte)
// Naipes ilustrados substituem ♠♣♦♥. Tudo inline, sem <defs>/<use>
// para nunca colidir IDs quando o mesmo naipe aparece N vezes.
// ════════════════════════════════════════════════════════════

const SUIT_COLORS = {
    LAW:          { fill: '#2563eb', outline: '#1d4ed8' },
    DELEGADO:     { fill: '#2563eb', outline: '#1d4ed8' },
    ESCRIVAO:     { fill: '#2563eb', outline: '#1d4ed8' },
    OUTLAW:       { fill: '#dc2626', outline: '#b91c1c' },
    BOSS:         { fill: '#dc2626', outline: '#b91c1c' },
    FALSIFICADOR: { fill: '#dc2626', outline: '#b91c1c' }
};

const STAR_POLY = "50.0,16.0 59.1,39.5 84.2,40.9 64.7,56.8 71.2,81.1 50.0,67.5 28.8,81.1 35.3,56.8 15.8,40.9 40.9,39.5";
const STAR_TIPS_R = 7;
const SKULL_PATH = "M50 10 C27 10 15 26 15 44 C15 56 21 63 28 67 L28 78 Q28 85 35 85 L65 85 Q72 85 72 78 L72 67 C79 63 85 56 85 44 C85 26 73 10 50 10 Z";

function _starPaths() {
    let tips = '';
    for (let i = 0; i < 5; i++) {
        const a = (-90 + 72 * i) * Math.PI / 180;
        tips += `<circle cx="${(50 + 36 * Math.cos(a)).toFixed(1)}" cy="${(52 + 36 * Math.sin(a)).toFixed(1)}" r="7"/>`;
    }
    return `<polygon points="${STAR_POLY}"/>${tips}`;
}

// ── Naipes (viewBox 0 0 100 100) ──
function suitStar(fill, outline) {
    const base = _starPaths();
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`
        + `<g fill="${outline}" stroke="${outline}" stroke-width="7" stroke-linejoin="round">${base}</g>`
        + `<g fill="${fill}">${base}</g>`
        + `<circle cx="50" cy="52" r="10.5" fill="none" stroke="${outline}" stroke-width="3.5"/></svg>`;
}
function suitSkull(fill, outline, holes) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`
        + `<path d="${SKULL_PATH}" fill="${outline}" stroke="${outline}" stroke-width="7" stroke-linejoin="round"/>`
        + `<path d="${SKULL_PATH}" fill="${fill}"/>`
        + `<ellipse cx="36.5" cy="46" rx="9.5" ry="11" fill="${holes}"/>`
        + `<ellipse cx="63.5" cy="46" rx="9.5" ry="11" fill="${holes}"/>`
        + `<path d="M50 58 L43.5 69 Q50 73 56.5 69 Z" fill="${holes}"/>`
        + `<rect x="41.5" y="76" width="4" height="9" rx="2" fill="${holes}"/>`
        + `<rect x="54.5" y="76" width="4" height="9" rx="2" fill="${holes}"/></svg>`;
}
function suitDelegado(fill, outline) {
    const base = _starPaths();
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`
        + `<circle cx="50" cy="52" r="45" fill="none" stroke="${outline}" stroke-width="7"/>`
        + `<g transform="translate(50 52) scale(0.7) translate(-50 -52)">`
        + `<g fill="${outline}" stroke="${outline}" stroke-width="7" stroke-linejoin="round">${base}</g>`
        + `<g fill="${fill}">${base}</g>`
        + `<circle cx="50" cy="52" r="10.5" fill="none" stroke="${outline}" stroke-width="3.5"/></g></svg>`;
}
function suitBoss(fill, outline, holes) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`
        + `<g transform="translate(0 11) scale(0.96) translate(2 0)">`
        + `<path d="${SKULL_PATH}" fill="${outline}" stroke="${outline}" stroke-width="7" stroke-linejoin="round"/>`
        + `<path d="${SKULL_PATH}" fill="${fill}"/>`
        + `<ellipse cx="36.5" cy="46" rx="9.5" ry="11" fill="${holes}"/>`
        + `<ellipse cx="63.5" cy="46" rx="9.5" ry="11" fill="${holes}"/>`
        + `<path d="M50 58 L43.5 69 Q50 73 56.5 69 Z" fill="${holes}"/></g>`
        + `<ellipse cx="50" cy="22" rx="37" ry="8" fill="${outline}"/>`
        + `<path d="M30 22 Q30 2 50 2 Q70 2 70 22 Q50 29 30 22 Z" fill="${fill}" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>`
        + `<rect x="30" y="14" width="40" height="5.5" rx="2.5" fill="${outline}"/></svg>`;
}

// ── Naipes em ESCUDO (distintivo) — Delegado, Escrivão, Falsificador ──
const _SHIELD = 'M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z';
function _shieldWrap(innerSvg, fill, outline) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`
        + `<path d="${_SHIELD}" fill="${outline}" stroke="${outline}" stroke-width="8" stroke-linejoin="round"/>`
        + `<path d="${_SHIELD}" fill="${fill}"/>`
        + `<path d="${_SHIELD}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity="0.5" transform="scale(0.86)" transform-origin="50 50"/>`
        + innerSvg + `</svg>`;
}
function _shieldStarInner() {
    let pts = '', tips = '';
    for (let j = 0; j < 10; j++) {
        const rad = (j % 2 === 0) ? 20 : 8.8;
        const a = (-90 + 36 * j) * Math.PI / 180;
        pts += `${(50 + rad * Math.cos(a)).toFixed(1)},${(48 + rad * Math.sin(a)).toFixed(1)} `;
    }
    for (let i = 0; i < 5; i++) {
        const a = (-90 + 72 * i) * Math.PI / 180;
        tips += `<circle cx="${(50 + 20 * Math.cos(a)).toFixed(1)}" cy="${(48 + 20 * Math.sin(a)).toFixed(1)}" r="3.6"/>`;
    }
    return `<g fill="#fff"><polygon points="${pts.trim()}"/>${tips}</g>`;
}
function _shieldPenInner(outline) {
    return `<g transform="translate(50 50) rotate(42) translate(-50 -50)">`
        + `<rect x="44" y="26" width="12" height="34" rx="5" fill="#fff"/>`
        + `<rect x="43.5" y="56" width="13" height="3.5" rx="1.5" fill="${outline}"/>`
        + `<path d="M44 60 L56 60 L50 76 Z" fill="#fff"/>`
        + `<path d="M50 62 L50 73" stroke="${outline}" stroke-width="1.8" stroke-linecap="round"/>`
        + `<circle cx="50" cy="63.5" r="1.8" fill="${outline}"/>`
        + `<rect x="45.5" y="22" width="9" height="6" rx="2.5" fill="${outline}"/></g>`;
}
function _shieldSkullInner(outline) {
    return `<g transform="translate(50 49) scale(0.5) translate(-50 -50)">`
        + `<path d="${SKULL_PATH}" fill="#fff"/>`
        + `<ellipse cx="36.5" cy="46" rx="10" ry="12" fill="${outline}"/>`
        + `<ellipse cx="63.5" cy="46" rx="10" ry="12" fill="${outline}"/>`
        + `<path d="M50 58 L43 70 Q50 74 57 70 Z" fill="${outline}"/></g>`;
}
function suitDelegadoShield(fill, outline) { return _shieldWrap(_shieldStarInner(), fill, outline); }
function suitEscrivao(fill, outline)       { return _shieldWrap(_shieldPenInner(outline), fill, outline); }
function suitFalsificador(fill, outline)   { return _shieldWrap(_shieldSkullInner(outline), fill, outline); }

// Naipe por papel (suitKey: LAW | DELEGADO | ESCRIVAO | OUTLAW | BOSS | FALSIFICADOR)
function suitSVG(suitKey) {
    const c = SUIT_COLORS[suitKey] || SUIT_COLORS.LAW;
    if (suitKey === 'DELEGADO')     return suitDelegadoShield(c.fill, c.outline);
    if (suitKey === 'ESCRIVAO')     return suitEscrivao(c.fill, c.outline);
    if (suitKey === 'FALSIFICADOR') return suitFalsificador(c.fill, c.outline);
    if (suitKey === 'OUTLAW')       return suitSkull(c.fill, c.outline, '#fff');
    if (suitKey === 'BOSS')         return suitBoss(c.fill, c.outline, '#fff');
    return suitStar(c.fill, c.outline);
}
const SUIT_LETTER = { LAW: 'L', DELEGADO: 'D', ESCRIVAO: 'E', OUTLAW: 'F', BOSS: 'C', FALSIFICADOR: 'X' };

// ════════════════════════════════════════════
// FICHAS (viewBox 0 0 200 200) — OFICIAIS (idênticas ao mockup aprovado)
// As frentes vêm de templates exatos; IDs trocados por sufixo único a
// cada chamada (a ficha cheia se repete na tela de resultado, e IDs
// fixos colidiriam, quebrando os textos curvos e o naipe).
// ════════════════════════════════════════════
// ════════════════════════════════════════════
// FICHAS DE PÔQUER — arte pronta, recortada em círculo
// ════════════════════════════════════════════
// O relevo (a lateral da ficha) continua no CSS: uma sombra sólida
// deslocada para baixo, com a espessura que cada tela define em
// --chip-depth. A arte em si é PNG com o fora do círculo transparente.

const CHIP_ART = {
    lei:     'images/chip-lei.png',      // estrela de xerife, azul
    fora:    'images/chip-fora.png',     // caveira, vermelha
    estrela: 'images/chip-estrela.png',  // verso neutro, vinho
    vazia:   'images/chip-num.png'       // vinho sem miolo, para levar número
};

function _chipArt(tipo, dentro) {
    return `<img class="chip-art ${tipo}" src="${CHIP_ART[tipo]}" alt="" draggable="false">`
         + (dentro || '');
}

// Ficha CHEIA (decisão e resultado): 'red' → caveira | 'blue' → estrela
function chipFull(team) { return _chipArt(team === 'red' ? 'fora' : 'lei'); }

// Verso NEUTRO — igual para os dois times; um verso por time entregaria a escolha
function chipBack() { return _chipArt('estrela'); }

// Ficha da trilha ainda não jogada: leva no centro o tamanho da equipe
function chipBackNumbered(n) { return _chipArt('vazia', `<b class="chip-num">${n}</b>`); }

// Frente da ficha da trilha depois de resolvida
function missionFrontSVG(status) { return chipFull(status === 'fail' ? 'red' : 'blue'); }

// Mini-ficha de rejeição: vazia enquanto não aconteceu, caveira depois
function rejectChipSVG(filled) { return _chipArt(filled ? 'fora' : 'vazia'); }

// ════════════════════════════════════════════
// VERSO DA CARTA — moldura dourada sobre vinho
// ════════════════════════════════════════════
// Simetria de 180° como em baralho de verdade: o miolo é desenhado uma vez
// e repetido girado, então o verso "lê" igual de cabeça para baixo.
// Camadas, de dentro para fora: medalhão (112) → louros (152) → texto (176).

const CB = {
    vinho: '#6d1026', escuro: '#42081a',
    ouro: '#f5b93b', ouroClaro: '#ffd873', ouroEsc: '#b9781c',
    cx: 250, cy: 350, w: 500, h: 700
};

const _cbPonto = (a, r) => [
    CB.cx + r * Math.cos(a * Math.PI / 180),
    CB.cy + r * Math.sin(a * Math.PI / 180)
];

function _cbEstrela(cx, cy, r, fill) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const raio = i % 2 === 0 ? r : r * 0.42;
        const ang = -Math.PI / 2 + i * Math.PI / 5;
        pts.push(`${(cx + raio * Math.cos(ang)).toFixed(1)},${(cy + raio * Math.sin(ang)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}

// Losango de brilho (4 pontas)
function _cbBrilho(cx, cy, r) {
    const k = r * 0.2;
    return `<path d="M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy}`
        + ` Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy}`
        + ` Q${cx - k} ${cy - k} ${cx} ${cy - r} Z" fill="${CB.ouroClaro}"/>`;
}

// Ramo de louros do lado esquerdo: arco + folhas apontando para fora
function _cbRamo() {
    const R = 152;
    const [x1, y1] = _cbPonto(-104, R);
    const [x2, y2] = _cbPonto(104, R);
    let s = `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 1 0 ${x2.toFixed(1)} ${y2.toFixed(1)}"`
        + ` fill="none" stroke="url(#cbOuro)" stroke-width="7" stroke-linecap="round"/>`;
    for (const a of [-78, -52, -26, 0, 26, 52, 78]) {
        const ang = 180 - a;                       // espelha para o lado esquerdo
        const [px, py] = _cbPonto(ang, R);
        s += `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(ang + 90).toFixed(1)})">`
            + `<path d="M0 0 C16 -9 34 -6 42 6 C26 15 8 12 0 0 Z" fill="${CB.ouro}"/>`
            + `<path d="M0 0 C16 9 34 6 42 -6 C26 -15 8 -12 0 0 Z" fill="${CB.ouroEsc}" opacity="0.75"/>`
            + `</g>`;
    }
    return s;
}

// Medalhão do canto superior esquerdo
function _cbCanto() {
    return `<g>`
        + `<path d="M52 140 A88 88 0 0 1 140 52" fill="none" stroke="${CB.ouro}" stroke-width="7" stroke-linecap="round"/>`
        + `<path d="M52 168 A116 116 0 0 1 168 52" fill="none" stroke="${CB.ouro}" stroke-width="2.5" opacity="0.8"/>`
        + `<path d="M104 60 C128 66 142 84 146 104 C126 100 110 84 104 60 Z" fill="${CB.ouro}"/>`
        + `<path d="M60 104 C66 128 84 142 104 146 C100 126 84 110 60 104 Z" fill="${CB.ouro}"/>`
        + _cbEstrela(96, 96, 25, CB.ouro)
        + _cbEstrela(96, 96, 11, CB.vinho)
        + `</g>`;
}

function cardBackSVG() {
    const { w: W, h: H, cx, cy } = CB;
    const R_TXT = 176;
    const [ax, ay] = _cbPonto(180, R_TXT);
    const [bx, by] = _cbPonto(0, R_TXT);

    const espelhoH = g => `<g transform="translate(${W} 0) scale(-1 1)">${g}</g>`;
    const giro180 = g => `<g transform="rotate(180 ${cx} ${cy})">${g}</g>`;

    const louros = _cbRamo() + espelhoH(_cbRamo());
    const texto = `<text><textPath href="#cbArco" startOffset="50%" text-anchor="middle">SALOON</textPath></text>`;

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`
        + `<defs>`
        + `<radialGradient id="cbFundo" cx="50%" cy="45%" r="70%">`
        + `<stop offset="0%" stop-color="#86152f"/><stop offset="100%" stop-color="${CB.vinho}"/></radialGradient>`
        + `<linearGradient id="cbOuro" x1="0" y1="0" x2="0" y2="1">`
        + `<stop offset="0%" stop-color="${CB.ouroClaro}"/><stop offset="100%" stop-color="${CB.ouroEsc}"/></linearGradient>`
        + `<path id="cbArco" d="M${ax.toFixed(1)} ${ay.toFixed(1)} A${R_TXT} ${R_TXT} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}"/>`
        + `</defs>`

        + `<rect width="${W}" height="${H}" rx="34" fill="url(#cbFundo)"/>`
        + `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="28" fill="none" stroke="${CB.escuro}" stroke-width="14"/>`
        + `<rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="22" fill="none" stroke="url(#cbOuro)" stroke-width="7"/>`
        + `<rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="16" fill="none" stroke="${CB.ouro}" stroke-width="2.5" opacity="0.75"/>`

        + _cbCanto() + espelhoH(_cbCanto())
        + `<g transform="translate(0 ${H}) scale(1 -1)">${_cbCanto()}</g>`
        + `<g transform="translate(${W} ${H}) scale(-1 -1)">${_cbCanto()}</g>`

        + louros

        + _cbBrilho(cx, 150, 24) + _cbBrilho(cx, H - 150, 24)
        + _cbBrilho(cx, 196, 11) + _cbBrilho(cx, H - 196, 11)

        + `<circle cx="${cx}" cy="${cy}" r="118" fill="${CB.escuro}" opacity="0.3"/>`
        + `<circle cx="${cx}" cy="${cy}" r="112" fill="none" stroke="url(#cbOuro)" stroke-width="9"/>`
        + `<circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${CB.ouro}" stroke-width="2.5" opacity="0.8"/>`
        + _cbEstrela(cx, cy, 84, 'url(#cbOuro)')
        + _cbEstrela(cx, cy, 29, CB.ouroClaro)

        + `<g font-family="Bebas Neue, sans-serif" font-size="54" letter-spacing="8"`
        + ` fill="url(#cbOuro)" stroke="${CB.escuro}" stroke-width="2.5" paint-order="stroke">`
        + texto + giro180(texto)
        + `</g>`
        + `</svg>`;
}
