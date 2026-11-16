// Uso: npm run eval [-- id1 id2 ...]
// Corre las preguntas de ../data/evaluacion.json contra la base real (solo lectura) y Gemini, y compara los eventos elegidos.
// Gasta una solicitud del LLM por caso con eventos vigentes (~30 por corrida).
import { readFileSync } from 'node:fs';
import { armarRespuesta, eventosVigentes } from '../src/chatbot.js';
import { connectDb, disconnectDb } from '../src/db.js';
import { elegirEventos } from '../src/llm.js';

const PAUSA_MS = 4500; // el plan gratuito permite ~15 solicitudes por minuto
const esperar = ms => new Promise(r => setTimeout(r, ms));

const { casos } = JSON.parse(readFileSync(new URL('../../data/evaluacion.json', import.meta.url), 'utf8'));
const soloIds = process.argv.slice(2).map(Number);
const elegidos = soloIds.length ? casos.filter(c => soloIds.includes(c.id)) : casos;

// Pregunta como lo hace el endpoint; reintenta una vez si Gemini está sobrecargado (502 por un 503 de Google).
async function responder(caso) {
    const eventos = await eventosVigentes(caso.hoy);
    if (!eventos.length) return armarRespuesta({ numeros: [] }, eventos, caso.hoy);
    for (let intento = 1; ; intento++) {
        try {
            return armarRespuesta(await elegirEventos(caso.pregunta, eventos, caso.hoy), eventos, caso.hoy);
        } catch (err) {
            if (err.status !== 502 || intento === 2) throw err;
            await esperar(10_000);
        }
    }
}

// Devuelve la lista de problemas del caso; vacía = aprobado.
function revisar(caso, { fichas }) {
    const nombres = fichas.map(f => f.nombre);
    const aparece = prefijo => nombres.some(n => n.startsWith(prefijo));
    if (caso.no_se) return nombres.length ? [`debía decir "no sé" y mostró: ${nombres.join(' | ')}`] : [];
    return [
        ...(caso.esperados ?? []).filter(p => !aparece(p)).map(p => `faltó: ${p}`),
        ...(caso.prohibidos ?? []).filter(aparece).map(p => `sobró: ${p}`),
    ];
}

await connectDb(process.env.MONGODB_URI);
let aprobados = 0;
try {
    for (const caso of elegidos) {
        let problemas;
        try {
            problemas = revisar(caso, await responder(caso));
        } catch (err) {
            problemas = [`error del LLM: ${err.message}`];
            if (err.status === 429) { console.log('Límite diario agotado; se detiene la evaluación.'); break; }
        }
        if (!problemas.length) aprobados++;
        console.log(`${problemas.length ? '✖' : '✔'} #${caso.id} (${caso.hoy}) ${caso.pregunta}`);
        problemas.forEach(p => console.log(`     ${p}`));
        if (problemas.length && caso._nota) console.log(`     nota: ${caso._nota}`);
        await esperar(PAUSA_MS);
    }
} finally {
    await disconnectDb();
}
console.log(`\nAprobados: ${aprobados}/${elegidos.length} (${Math.round((100 * aprobados) / elegidos.length)} %)`);
