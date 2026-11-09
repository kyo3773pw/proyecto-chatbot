import { Event } from './models/event.model.js';

//convierte una fila del CSV en los datos que espera el modelo Event.
export function filaAEvento(fila) {
    const evento = {};
    for (const [columna, valor] of Object.entries(fila)) {
        const limpio = valor.trim();
        if (limpio !== '') evento[columna] = limpio;
    }
    if (evento.pais_elegible) evento.pais_elegible = separar(evento.pais_elegible, ',');
    if (evento.otras_fechas) {
        evento.otras_fechas = separar(evento.otras_fechas, ';').map(par => {
            const [descripcion, fecha] = par.split('=').map(s => s.trim());
            return { descripcion, fecha };
        });
    }
    return evento;
}

function separar(texto, separador) {
    return texto.split(separador).map(s => s.trim()).filter(s => s !== '');
}

//campos del modelo que se comparan; los de sistema los maneja Mongo.
const CAMPOS = Object.keys(Event.schema.paths).filter(c => !['_id', '__v', 'createdAt', 'updatedAt'].includes(c));

//devuelve los campos cuyo valor cambio entre dos eventos (fechas y listas incluidas).
function camposCambiados(antes, despues) {
    const a = antes.toObject();
    const b = despues.toObject();
    return CAMPOS.filter(c => JSON.stringify(a[c]) !== JSON.stringify(b[c]));
}

// Decide qué pasaría con cada fila (crear, actualizar, sin_cambios o error). Solo guarda si confirmar es true.
// ponytail: una consulta por fila; suficiente para cientos de eventos, usar bulkWrite si llegan a miles.
export async function prepararImportacion(filas, { confirmar = false } = {}) {
    const informe = [];
    const vistas = new Map(); // nombre|fecha_inicio -> fila, para detectar duplicados dentro del mismo CSV

    for (const [i, fila] of filas.entries()) {
        const item = { fila: i + 2, nombre: fila.nombre }; // +2: encabezado y filas contadas desde 1
        informe.push(item);
        const datos = filaAEvento(fila);
        const nuevo = new Event(datos);

        try {
            await nuevo.validate();
        } catch (err) {
            Object.assign(item, { accion: 'error', errores: Object.values(err.errors).map(e => e.message) });
            continue;
        }

        const clave = `${nuevo.nombre}|${nuevo.fecha_inicio?.toISOString()}`;
        if (vistas.has(clave)) {
            Object.assign(item, { accion: 'error', errores: [`duplicado de la fila ${vistas.get(clave)}`] });
            continue;
        }
        vistas.set(clave, item.fila);

        // null (no undefined) para encontrar también eventos sin fecha_inicio: mongoose ignora filtros undefined.
        const existente = await Event.findOne({ nombre: nuevo.nombre, fecha_inicio: nuevo.fecha_inicio ?? null });
        if (!existente) {
            item.accion = 'crear';
            if (confirmar) await nuevo.save();
            continue;
        }

        const campos = camposCambiados(existente, nuevo);
        if (campos.length === 0) {
            item.accion = 'sin_cambios';
            continue;
        }
        Object.assign(item, { accion: 'actualizar', campos });
        if (confirmar) {
            existente.overwrite(datos); // el CSV es la fuente de verdad; _id y createdAt se conservan
            await existente.save();
        }
    }

    const resumen = { crear: 0, actualizar: 0, sin_cambios: 0, error: 0 };
    for (const item of informe) resumen[item.accion]++;
    return { resumen, filas: informe };
}