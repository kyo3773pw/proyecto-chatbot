import { Event } from '../models/event.model.js';
import { csvAObjetos } from '../csv.js';
import { prepararImportacion } from '../importar-eventos.js';

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