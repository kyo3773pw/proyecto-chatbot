import { Event } from './models/event.model.js';

// "AAAA-MM-DD" -> Date a medianoche UTC, igual que mongoose guarda las fechas del CSV.
const aFecha = hoy => new Date(`${hoy}T00:00:00Z`);

//Fecha de hoy en Peru como "AAAA-MM-DD" EL FORMATO EN ca ES JSUTAMENTE ESE.
export const hoyEnPeru = () => new Date().toLocaleDateString('en-CA', {timeZone: 'America/Lima' });

// Eventos vigentes a la fecha `hoy`: fecha_fin >= hoy, o fecha_limite >= hoy si no hay fecha_fin.
export function eventosVigentes(hoy) {
    const dia = aFecha(hoy);
    return Event.find({
        $or: [
            { fecha_fin: { $gte: dia } },
            { fecha_fin: null, fecha_limite: { $gte: dia } },
        ],
    }).sort({ fecha_inicio: 1, fecha_limite: 1 }).lean();
}

// Estado de un evento vigente respecto de `hoy`, para mostrar en su ficha.
export function estadoEvento(evento, hoy) {
    const dia = aFecha(hoy);
    if (evento.fecha_limite && evento.fecha_limite < dia) return 'inscripcion_cerrada';
    if (evento.fecha_inicio && evento.fecha_inicio <= dia) return 'en_curso';
    if (evento.fecha_limite) return 'inscripcion_abierta';
    return 'proximo';
}

const NO_SE = 'No tengo eventos que coincidan con tu pregunta. Prueba con otras palabras o pregunta por congresos, becas o cursos.';
const TEXTO_POR_DEFECTO = 'Estos eventos coinciden con tu pregunta:';
// Fechas ("13 de noviembre", 13/11, 2026-11-13), horas, enlaces, correos y teléfonos: el texto del LLM no debe traerlos.
const PROHIBIDO = /\d{1,2}\s+de\s+[a-záéíóú]+|\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2}|\d{1,2}:\d{2}|https?:\/\/|www\.|@|\d{3}[\s-]?\d{3}[\s-]?\d{3}/i;

// Respuesta final: el texto del LLM (solo si no trae datos prohibidos) + fichas armadas desde la base.
export function armarRespuesta(eleccion, eventos, hoy) {
    const elegidos = [...new Set(eleccion.numeros)]
        .filter(n => Number.isInteger(n) && n >= 1 && n <= eventos.length)
        .map(n => eventos[n - 1]);
    if (elegidos.length === 0) return { texto: NO_SE, fichas: [] };

    const texto = eleccion.texto && !PROHIBIDO.test(eleccion.texto) ? eleccion.texto : TEXTO_POR_DEFECTO;
    return { texto, fichas: elegidos.map(e => ficha(e, hoy)) };
}

// Lo que ve el estudiante de cada evento: todo sale de la base, nada del LLM.
function ficha(e, hoy) {
    const dia = d => d?.toISOString().slice(0, 10);
    return {
        nombre: e.nombre, type: e.type, dirigido_a: e.dirigido_a, lugar: e.lugar, modalidad: e.modalidad,
        costo: e.costo, contacto: e.contacto, url_registro: e.url_registro,
        fecha_inicio: dia(e.fecha_inicio), fecha_fin: dia(e.fecha_fin), fecha_limite: dia(e.fecha_limite),
        estado: estadoEvento(e, hoy),
    };
}