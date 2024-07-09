import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    fecha_inicio: { type: Date, required: true },
    fecha_fin: { type: Date, required: true },
    url_registro: { type: String, required: true },
    type: { type: String, required: true }  // Tipo de evento: congreso, beca, curso_extracurricular
});

export default mongoose.model('Event', eventSchema);
