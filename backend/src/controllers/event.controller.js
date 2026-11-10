import { Event } from '../models/event.model.js';
import { csvAObjetos } from '../csv.js';
import { filaAEvento, prepararImportacion } from '../importar-eventos.js';
import { extraerEvento} from '../llm.js';
import { camposNoEncontrados } from '../verificar-extraccion.js';

export async function createEvent(req, res) {
    // _id y las fechas de sistema las pone mongo, no el cliente.
    const { _id, createdAt, updatedAt, ...datos } = req.body || {};
    const event = await Event.create(datos);
    res.status(201).json({ event });
}

export async function listEvents(req, res) {
    //sin paginacion , agregar cuando haya mas eventos
    const events = await Event.find().sort({ fecha_inicio: 1 });
    res.json({ events });
}

export async function importEvents(req, res) {
    const { csv, confirmar } = req.body ?? {};
    if (typeof csv !== 'string' || csv.trim() === '') {
        return res.status(400).json({ error: 'falta el texto del CSV en el campo "csv"' });
    }
    const informe = await prepararImportacion(csvAObjetos(csv), { confirmar: confirmar === true });
    res.json({ informe });
}

const MAX_TEXTO = 10_000; //maximo de caracteres que se le pasa al LLM para extraer el evento

export async function extractEvent(req, res) {
    const { texto } = req.body ?? {};
    if (typeof texto !== 'string' || texto.trim() === '') {
        return res.status(400).json({ error: 'falta el texto en el campo "texto"' });
    }
    if (texto.length > MAX_TEXTO) {
        return res.status(400).json({ error: `el texto supera ${MAX_TEXTO} caracteres; pega solo el post` });
    }
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }); //yyyy-mm-dd en hora Peru
    const evento = { ...filaAEvento(await extraerEvento(texto, hoy)), fecha_captura: hoy, origen: 'real' };
    res.json({ evento, sospechosos: camposNoEncontrados(evento, texto) });
}