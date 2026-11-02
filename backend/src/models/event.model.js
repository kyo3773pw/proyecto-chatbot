import mongoose from 'mongoose';

export const TYPES = ['congreso', 'beca', 'curso_extracurricular', 'otro'];
export const AMBITOS = ['universidad', 'nacional', 'internacional', 'externo'];
export const MODALIDADES = ['presencial', 'virtual', 'hibrido'];
export const ORIGENES = ['real', 'sintetico'];

//devuelve una funcion que mongoose llama para saber si el campo es obligatorio para este documento.
function esTipo(...tipos) {
    return function () {
        return tipos.includes(this.type);
    };
}

const texto = { type: String, trim: true, maxlength:2000 };
const url = { type: String, trim: true, match: [/^https?:\/\//, 'debe empezar con https:// o http://'] };

const eventSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true, maxlength: 200 },
        type: { type: String, required: true, enum: TYPES },
        ambito: { type: String, required: true, enum: AMBITOS },
        dirigido_a: texto,
        pais_elegible: [{ type: String, trim:true }],
        modalidad: { type: String, enum: MODALIDADES, required: esTipo('curso_extracurricular') },
        lugar: texto,
        fecha_inicio: { type: Date, required: esTipo('congreso', 'curso_extracurricular') },
        fecha_fin: { type: Date, required: esTipo('congreso', 'curso_extracurricular') },
        hora: { type: String, match: [/^\d{2}:\d{2}$/, 'Formato HH:MM'] },
        fecha_limite: { type: Date, required: esTipo('beca') },
        otras_fechas: [{ _id: false, descripcion: {type: String, required: true, trim: true }, fecha: { type: Date, required: true } }],
        requisitos: texto,
        costo: texto,
        contacto: texto,
        notas: { type: String, trim: true, maxlength: 5000 },
        url_registro: url,
        fuente_url: url,
        fecha_captura: { type: Date, required: true },
        origen: { type: String, required: true, enum: ORIGENES },
    },
    { timestamps: true},
);

eventSchema.pre('validate', function () {
    if (!this.fecha_fin && !this.fecha_limite) {
        this.invalidate('fecha_fin', 'se requiere fecha_fin o fecha_limite para saber si esta vigente');
    }
    if (this.fecha_inicio && this.fecha_fin && this.fecha_inicio > this.fecha_fin) {
        this.invalidate('fecha_fin', 'fecha_fin no puede ser anterior a fecha_inicio');
    }
    if (this.fecha_limite && this.fecha_fin && this.fecha_limite > this.fecha_fin) {
        this.invalidate('fecha_limite', 'fecha_limite no puede ser posterior a fecha_fin');
    }
});

//evita cargar dos veces el mismo evento.
eventSchema.index({ nombre: 1, fecha_inicio: 1 }, { unique: true });

export const Event = mongoose.model('Event', eventSchema);