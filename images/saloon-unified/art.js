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
const CHIP_C = {
    blue: { base: '#2563eb', dark: '#1d4ed8', side: '#14368a' },
    red:  { base: '#dc2626', dark: '#b91c1c', side: '#8f1313' },
    wine: { base: '#881337', dark: '#6b0f2b', side: '#4a0a1e' }
};

// Templates aprovados (estrela = Lei/azul, caveira = Fora-da-Lei/vermelha).
// O placeholder __U__ vira um id único por chamada.
const _CHIP_FRENTE_AZ = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="96" fill="#2563eb" stroke="#1d4ed8" stroke-width="6"/><circle cx="100" cy="100" r="86" fill="none" stroke="#2563eb" stroke-width="21"/><circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-width="21" stroke-dasharray="33.77 33.77" stroke-dashoffset="16.89"/><circle cx="100" cy="100" r="74" fill="#2563eb" stroke="#1d4ed8" stroke-width="3.5"/><path d="M 152.0,59.4 A 66,66 0 0 1 152.0,140.6" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="1 7.5" stroke-linecap="round" opacity="0.85"/><path d="M 48.0,140.6 A 66,66 0 0 1 48.0,59.4" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="1 7.5" stroke-linecap="round" opacity="0.85"/><defs><path id="__U__aTfa" d="M 45,104 A 55,55 0 0 1 155,104"/><path id="__U__aBfa" d="M 47,112 A 53,53 0 0 0 153,112"/></defs><text font-family="Bebas Neue, sans-serif" font-size="18" letter-spacing="3.5" fill="#fff"><textPath href="#__U__aTfa" startOffset="50%" text-anchor="middle">SALOON</textPath></text><text font-family="Bebas Neue, sans-serif" font-size="14" letter-spacing="2.5" fill="#fff" opacity="0.9"><textPath href="#__U__aBfa" startOffset="50%" text-anchor="middle">&#9733; RED ROCK &#9733;</textPath></text><g transform="translate(100 99) scale(0.86) translate(-50 -50)"><g><defs><g id="__U__sfa"><polygon points="50.0,16.0 59.1,39.5 84.2,40.9 64.7,56.8 71.2,81.1 50.0,67.5 28.8,81.1 35.3,56.8 15.8,40.9 40.9,39.5"/><circle cx="50.0" cy="16.0" r="7"/><circle cx="84.2" cy="40.9" r="7"/><circle cx="71.2" cy="81.1" r="7"/><circle cx="28.8" cy="81.1" r="7"/><circle cx="15.8" cy="40.9" r="7"/></g></defs><use href="#__U__sfa" fill="#1d4ed8" stroke="#1d4ed8" stroke-width="7" stroke-linejoin="round"/><use href="#__U__sfa" fill="#fff"/><circle cx="50" cy="52" r="10.5" fill="none" stroke="#1d4ed8" stroke-width="3.5"/></g></g></svg>`;
const _CHIP_FRENTE_VM = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="96" fill="#dc2626" stroke="#b91c1c" stroke-width="6"/><circle cx="100" cy="100" r="86" fill="none" stroke="#dc2626" stroke-width="21"/><circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-width="21" stroke-dasharray="33.77 33.77" stroke-dashoffset="16.89"/><circle cx="100" cy="100" r="74" fill="#dc2626" stroke="#b91c1c" stroke-width="3.5"/><path d="M 152.0,59.4 A 66,66 0 0 1 152.0,140.6" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="1 7.5" stroke-linecap="round" opacity="0.85"/><path d="M 48.0,140.6 A 66,66 0 0 1 48.0,59.4" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="1 7.5" stroke-linecap="round" opacity="0.85"/><defs><path id="__U__aTfv" d="M 45,104 A 55,55 0 0 1 155,104"/><path id="__U__aBfv" d="M 47,112 A 53,53 0 0 0 153,112"/></defs><text font-family="Bebas Neue, sans-serif" font-size="18" letter-spacing="3.5" fill="#fff"><textPath href="#__U__aTfv" startOffset="50%" text-anchor="middle">SALOON</textPath></text><text font-family="Bebas Neue, sans-serif" font-size="14" letter-spacing="2.5" fill="#fff" opacity="0.9"><textPath href="#__U__aBfv" startOffset="50%" text-anchor="middle">&#9733; RED ROCK &#9733;</textPath></text><g transform="translate(100 99) scale(0.86) translate(-50 -50)"><g><defs><path id="__U__sfv" d="M50 10 C27 10 15 26 15 44 C15 56 21 63 28 67 L28 78 Q28 85 35 85 L65 85 Q72 85 72 78 L72 67 C79 63 85 56 85 44 C85 26 73 10 50 10 Z"/></defs><use href="#__U__sfv" fill="#991b1b" stroke="#991b1b" stroke-width="7" stroke-linejoin="round"/><use href="#__U__sfv" fill="#fff"/><ellipse cx="36.5" cy="46" rx="9.5" ry="11" fill="#dc2626"/><ellipse cx="63.5" cy="46" rx="9.5" ry="11" fill="#dc2626"/><path d="M50 58 L43.5 69 Q50 73 56.5 69 Z" fill="#dc2626"/><rect x="41.5" y="76" width="4" height="9" rx="2" fill="#dc2626"/><rect x="54.5" y="76" width="4" height="9" rx="2" fill="#dc2626"/></g></g></svg>`;
const _CHIP_VERSO     = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g transform="translate(200 0) scale(-1 1)"><circle cx="100" cy="100" r="96" fill="#881337" stroke="#6b0f2b" stroke-width="6"/><circle cx="100" cy="100" r="86" fill="none" stroke="#881337" stroke-width="21"/><circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-width="21" stroke-dasharray="33.77 33.77" stroke-dashoffset="16.89"/><circle cx="100" cy="100" r="74" fill="#881337" stroke="#6b0f2b" stroke-width="3.5"/><line x1="140.0" y1="100.0" x2="164.0" y2="100.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="134.6" y1="120.0" x2="155.4" y2="132.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="120.0" y1="134.6" x2="132.0" y2="155.4" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="100.0" y1="140.0" x2="100.0" y2="164.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="80.0" y1="134.6" x2="68.0" y2="155.4" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="65.4" y1="120.0" x2="44.6" y2="132.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="60.0" y1="100.0" x2="36.0" y2="100.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="65.4" y1="80.0" x2="44.6" y2="68.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="80.0" y1="65.4" x2="68.0" y2="44.6" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="100.0" y1="60.0" x2="100.0" y2="36.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="120.0" y1="65.4" x2="132.0" y2="44.6" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><line x1="134.6" y1="80.0" x2="155.4" y2="68.0" stroke="#fff" stroke-width="3" opacity="0.5" stroke-linecap="round"/><circle cx="100" cy="100" r="40" fill="#6b0f2b" stroke="#fff" stroke-width="3"/><text x="100" y="117" font-family="Bebas Neue, sans-serif" font-size="46" text-anchor="middle" fill="#fff">&#9733;</text></g></svg>`;

let _chipUid = 0;
function _withUid(tpl) {
    _chipUid += 1;
    return tpl.split('__U__').join('c' + _chipUid);
}

// Anel base (gomos de cassino) — usado pelas variantes numerada/mini/rejeição
function _chipRings(base, dark, deco) {
    const circ = 2 * Math.PI * 86, dash = circ / 16;
    let s = `<circle cx="100" cy="100" r="96" fill="${base}" stroke="${dark}" stroke-width="6"/>`
        + `<circle cx="100" cy="100" r="86" fill="none" stroke="${base}" stroke-width="21"/>`
        + `<circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-width="21" stroke-dasharray="${dash.toFixed(2)} ${dash.toFixed(2)}" stroke-dashoffset="${(dash/2).toFixed(2)}"/>`
        + `<circle cx="100" cy="100" r="74" fill="${base}" stroke="${dark}" stroke-width="3.5"/>`;
    if (deco) {
        const p = (a) => [100 + 66*Math.cos(a*Math.PI/180), 100 + 66*Math.sin(a*Math.PI/180)];
        const [rx1,ry1]=p(-38),[rx2,ry2]=p(38),[lx1,ly1]=p(142),[lx2,ly2]=p(218);
        const c = 'fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="1 7.5" stroke-linecap="round" opacity="0.85"';
        s += `<path d="M ${rx1.toFixed(1)},${ry1.toFixed(1)} A 66,66 0 0 1 ${rx2.toFixed(1)},${ry2.toFixed(1)}" ${c}/>`
           + `<path d="M ${lx1.toFixed(1)},${ly1.toFixed(1)} A 66,66 0 0 1 ${lx2.toFixed(1)},${ly2.toFixed(1)}" ${c}/>`;
    }
    return s;
}

// Naipe BRANCO para o centro (numeradas/mini usam só estrela/caveira)
function _suitWhite(suitKey) {
    if (suitKey === 'OUTLAW') return suitSkull('#fff', '#991b1b', '#dc2626');
    if (suitKey === 'BOSS')   return suitBoss('#fff', '#991b1b', '#dc2626');
    if (suitKey === 'DELEGADO') return suitDelegado('#fff', '#1d4ed8');
    return suitStar('#fff', '#1d4ed8');
}

// Ficha CHEIA (resultado/decisão) — template aprovado, id único.
// team 'blue' → estrela (Lei) | 'red' → caveira (Fora-da-Lei)
function chipFull(team, suitKey) {
    return _withUid(team === 'red' ? _CHIP_FRENTE_VM : _CHIP_FRENTE_AZ);
}

// Verso ÚNICO neutro vinho (sem IDs, seguro repetir)
function chipBack() {
    return _CHIP_VERSO;
}

// Ficha NUMERADA (trilha de missões): número + naipe mini no topo
function chipNumber(team, suitKey, n) {
    const c = CHIP_C[team];
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${_chipRings(c.base, c.dark, true)}`
        + `<g transform="translate(100 56) scale(0.36) translate(-50 -50)">${_suitWhite(suitKey)}</g>`
        + `<text x="100" y="158" font-family="Bebas Neue, sans-serif" font-size="92" text-anchor="middle" fill="#fff" stroke="${c.dark}" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${n}</text></svg>`;
}

// Ficha PENDENTE (trilha, ainda não jogada): neutra branca com naipe vinho fraco
function chipPending(n) {
    const circ = 2 * Math.PI * 86, dash = circ / 16;
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">`
        + `<circle cx="100" cy="100" r="96" fill="#fff" stroke="#881337" stroke-width="6"/>`
        + `<circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-width="21"/>`
        + `<circle cx="100" cy="100" r="86" fill="none" stroke="#881337" stroke-width="21" stroke-dasharray="${dash.toFixed(2)} ${dash.toFixed(2)}" stroke-dashoffset="${(dash/2).toFixed(2)}" opacity="0.85"/>`
        + `<circle cx="100" cy="100" r="74" fill="#fff" stroke="#881337" stroke-width="3.5"/>`
        + `<text x="100" y="138" font-family="Bebas Neue, sans-serif" font-size="92" text-anchor="middle" fill="#881337">${n}</text></svg>`;
}

// Verso da ficha COM número da missão (selo central sobre o verso oficial).
// Usado na trilha para missões que ainda não aconteceram.
function chipBackNumbered(n) {
    const selo = `<circle cx="100" cy="100" r="34" fill="#6b0f2b" stroke="#fff" stroke-width="3"/>`
        + `<text x="100" y="118" font-family="Bebas Neue, sans-serif" font-size="40" text-anchor="middle" fill="#fff">${n}</text>`;
    return _CHIP_VERSO.replace('</svg>', selo + '</svg>');
}

// Frente da ficha de RESULTADO da trilha (sem número, naipe + textos).
// sucesso → azul (estrela) | falha → vermelha (caveira)
function missionFrontSVG(status) {
    return chipFull(status === 'fail' ? 'red' : 'blue', status === 'fail' ? 'OUTLAW' : 'LAW');
}

// Ficha da trilha de missões conforme o estado:
//   pendente → neutra branca com número | sucesso → azul (estrela) | falha → vermelha (caveira)
function missionChipSVG(number, status) {
    if (status === 'success') return chipNumber('blue', 'LAW', number);
    if (status === 'fail')    return chipNumber('red', 'OUTLAW', number);
    return chipPending(number);
}

// Mini-ficha de rejeição: pendente (neutra) ou preenchida (vermelha com caveira central)
function rejectChipSVG(filled) {
    if (filled) {
        const c = CHIP_C.red;
        return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${_chipRings(c.base, c.dark, true)}`
            + `<g transform="translate(100 100) scale(0.92) translate(-50 -50)">${_suitWhite('OUTLAW')}</g></svg>`;
    }
    // pendente: anel neutro vazio
    const circ = 2 * Math.PI * 86, dash = circ / 16;
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">`
        + `<circle cx="100" cy="100" r="96" fill="#fff" stroke="#881337" stroke-width="6"/>`
        + `<circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-width="21"/>`
        + `<circle cx="100" cy="100" r="86" fill="none" stroke="#881337" stroke-width="21" stroke-dasharray="${dash.toFixed(2)} ${dash.toFixed(2)}" stroke-dashoffset="${(dash/2).toFixed(2)}" opacity="0.85"/>`
        + `<circle cx="100" cy="100" r="74" fill="#fff" stroke="#881337" stroke-width="3.5"/></svg>`;
}
