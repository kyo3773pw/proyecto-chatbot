import { Event } from '../models/event.model.js';

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