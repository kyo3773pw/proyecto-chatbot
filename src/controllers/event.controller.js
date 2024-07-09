import Event from '../models/event.model.js';

export const addEvent = async (req, res) => {
    try {
        const { nombre, fecha_inicio, fecha_fin, url_registro, type } = req.body;

        const newEvent = new Event({
            nombre,
            fecha_inicio,
            fecha_fin,
            url_registro,
            type
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event added successfully' });
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).send('Server error');
    }
};
