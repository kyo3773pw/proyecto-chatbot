#!/usr/bin/env node
// Uso: node validate_events.mjs [archivo.csv] [--hoy YYYY-MM-DD]
import { readFileSync } from 'node:fs';
import { parseCsv } from '../backend/src/csv.js';

const COLUMNS = ['nombre', 'type', 'ambito', 'pais_elegible', 'fecha_inicio', 'fecha_fin', 'hora', 'lugar', 'modalidad',
    'requisitos', 'costo', 'fecha_limite', 'contacto', 'notas', 'url_registro', 'fuente_url', 'fecha_captura', 'origen'];
const REQUIRED = ['nombre', 'type', 'ambito', 'fecha_captura', 'origen'];
const ENUMS = {
    type: ['congreso', 'beca', 'curso_extracurricular', 'otro'],
    ambito: ['universidad', 'nacional', 'internacional', 'externo'],
    modalidad: ['presencial', 'virtual', 'hibrido'],
    origen: ['real', 'sintetico'],
};


function isValidDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function isHttpUrl(s) {
    try { return ['http:', 'https:'].includes(new URL(s).protocol); } catch { return false; }
}

const args = process.argv.slice(2);
const hoyIdx = args.indexOf('--hoy');
const hoy = hoyIdx >= 0 ? args.splice(hoyIdx, 2)[1] : null;
const file = args[0] ?? new URL('./events_seed.csv', import.meta.url).pathname;

if (hoy && !isValidDate(hoy)) { console.error('--hoy debe ser YYYY-MM-DD'); process.exit(2); }

const [header, ...body] = parseCsv(readFileSync(file, 'utf8'));
const errors = [], warnings = [];

const missingCols = COLUMNS.filter(c => !header.includes(c));
const extraCols = header.filter(c => !COLUMNS.includes(c));
if (missingCols.length) errors.push(`Faltan columnas: ${missingCols.join(', ')}`);
if (extraCols.length) warnings.push(`Columnas desconocidas (se ignoran): ${extraCols.join(', ')}`);

const seen = new Map();
const stats = { total: 0, porTipo: {}, porOrigen: {}, vigentes: 0, vencidos: 0 };

if (!missingCols.length) {
    body.forEach((cells, i) => {
        const line = i + 2;
        const e = Object.fromEntries(header.map((h, j) => [h, (cells[j] ?? '').trim()]));
        const err = msg => errors.push(`Línea ${line} (${e.nombre || 'sin nombre'}): ${msg}`);
        const warn = msg => warnings.push(`Línea ${line} (${e.nombre || 'sin nombre'}): ${msg}`);

        if (cells.length !== header.length) err(`tiene ${cells.length} columnas, se esperaban ${header.length}`);
        for (const f of REQUIRED) if (!e[f]) err(`falta ${f}`);
        if (!e.fecha_inicio !== !e.fecha_fin) err('fecha_inicio y fecha_fin van juntas (o ninguna)');
        else if (!e.fecha_inicio && !e.fecha_limite) err('falta fecha_inicio/fecha_fin o, al menos, fecha_limite');
        else if (!e.fecha_inicio) warn('sin fechas del evento; solo fecha_limite');
        for (const [f, allowed] of Object.entries(ENUMS))
            if (e[f] && !allowed.includes(e[f])) err(`${f}="${e[f]}" no es válido (${allowed.join('|')})`);
        for (const f of ['fecha_inicio', 'fecha_fin', 'fecha_limite', 'fecha_captura'])
            if (e[f] && !isValidDate(e[f])) err(`${f}="${e[f]}" no es una fecha YYYY-MM-DD válida`);
        if (isValidDate(e.fecha_inicio) && isValidDate(e.fecha_fin) && e.fecha_fin < e.fecha_inicio)
            err('fecha_fin es anterior a fecha_inicio');
        if (e.hora && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.hora)) err(`hora="${e.hora}" debe ser HH:MM (24 h)`);
        if (isValidDate(e.fecha_limite) && isValidDate(e.fecha_fin) && e.fecha_limite > e.fecha_fin)
            err('fecha_limite es posterior a fecha_fin');
        if (e.url_registro && !isHttpUrl(e.url_registro)) err('url_registro no es una URL http(s)');
        if (e.fuente_url && !isHttpUrl(e.fuente_url)) err('fuente_url no es una URL http(s)');
        if (e.origen === 'real' && !e.fuente_url) err('un evento real necesita fuente_url');
        if (hoy && isValidDate(e.fecha_captura) && e.fecha_captura > hoy) err('fecha_captura es posterior a --hoy');
        if (!e.lugar && e.modalidad !== 'virtual') warn('sin lugar (y no es virtual)');
        if (!e.requisitos) warn('sin requisitos');
        if (!e.hora) warn('sin hora');
        if (!e.url_registro) warn('sin url_registro');
        if (e.type === 'beca' && !e.pais_elegible) warn('beca sin pais_elegible');

        const key = `${e.nombre.toLowerCase()}|${e.fecha_inicio}`;
        if (seen.has(key)) err(`duplicado de la línea ${seen.get(key)}`);
        else seen.set(key, line);

        stats.total++;
        stats.porTipo[e.type] = (stats.porTipo[e.type] ?? 0) + 1;
        stats.porOrigen[e.origen] = (stats.porOrigen[e.origen] ?? 0) + 1;
        const cierre = e.fecha_fin || e.fecha_limite;
        if (hoy && isValidDate(cierre)) cierre >= hoy ? stats.vigentes++ : stats.vencidos++;
    });
}

console.log(`Archivo: ${file}`);
console.log(`Eventos: ${stats.total} | por tipo: ${JSON.stringify(stats.porTipo)} | por origen: ${JSON.stringify(stats.porOrigen)}`);
if (hoy) console.log(`Respecto a ${hoy}: ${stats.vigentes} vigentes, ${stats.vencidos} vencidos`);
warnings.forEach(w => console.log(`AVISO  ${w}`));
errors.forEach(x => console.log(`ERROR  ${x}`));
console.log(errors.length ? `\n${errors.length} error(es).` : '\nOK');
process.exit(errors.length ? 1 : 0);
