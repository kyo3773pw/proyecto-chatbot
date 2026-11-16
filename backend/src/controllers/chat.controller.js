import { hoyEnPeru, responderPregunta } from '../chatbot.js';

const MAX_PREGUNTA = 500;

// Valida la entrada; la lógica del chat está en responderPregunta (la misma que usa `npm run eval`).
export async function preguntar (req, res) {
    const { pregunta, hoy = hoyEnPeru() } = req.body ?? {};
    if (typeof pregunta !== 'string' || pregunta.trim() === '') {
        return res.status(400).json({ error: `Escribe una pregunta` });
    }
    if (pregunta.length > MAX_PREGUNTA) {
        return res.status(400).json({ error: `La pregunta supera ${MAX_PREGUNTA} caracteres` });
    }
    if (!fechaValida(hoy)) {
        return res.status(400).json({ error: '"hoy" debe ser una fecha AAAA-MM-DD' });
    }
    res.json({ ...(await responderPregunta(pregunta, hoy)), hoy });
}

//date acepta "2026-02-30" y lo convierte en 2 de marzo; por eso se compara la ida y vuelta.
function fechaValida(texto) {
    if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
    const fecha = new Date(`${texto}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}
