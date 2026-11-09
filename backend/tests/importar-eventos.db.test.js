import { dbSkipReason, testDbUri } from './helpers.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';

const { connectDb, disconnectDb } = await import('../src/db.js');
const { Event } = await import('../src/models/event.model.js');
const { csvAObjetos } = await import('../src/csv.js');
const { prepararImportacion } = await import('../src/importar-eventos.js');

const ENCABEZADO = 'nombre,type,ambito,fecha_limite,costo,fecha_captura,origen';
const beca = (nombre, costo = '') => `${nombre},beca,nacional,2026-12-01,${costo},2026-11-09,real`;

// El caso mixto del spec: nueva, inválida, existente con cambios, existente igual y un duplicado dentro del CSV.
const CSV = [
    ENCABEZADO,
    beca('Beca nueva'),
    'Beca rota,beca,nacional,,,2026-11-09,real', // beca sin fecha_limite
    beca('Beca existente cambiada', 'S/ 50'),
    beca('Beca existente igual'),
    beca('Beca nueva'), // duplicado de la fila 2
].join('\n');

describe('prepararImportacion', { skip: dbSkipReason }, () => {
    async function clearDb() {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map(c => c.deleteMany({})));
    }

    before(async () => {
        await connectDb(testDbUri);
        await clearDb();
        await Event.init();
        const base = { type: 'beca', ambito: 'nacional', fecha_limite: '2026-12-01', fecha_captura: '2026-11-09', origen: 'real' };
        await Event.create({ ...base, nombre: 'Beca existente cambiada', costo: 'Gratuito' });
        await Event.create({ ...base, nombre: 'Beca existente igual' });
    });
    after(async () => {
        try {
            await clearDb();
        } finally {
            await disconnectDb();
        }
    });

    it('vista previa: informe correcto y la base no cambia', async () => {
        const { resumen, filas } = await prepararImportacion(csvAObjetos(CSV));
        assert.deepEqual(resumen, { crear: 1, actualizar: 1, sin_cambios: 1, error: 2 });
        assert.deepEqual(filas.map(f => f.accion), ['crear', 'error', 'actualizar', 'sin_cambios', 'error']);
        assert.deepEqual(filas[2].campos, ['costo']);
        assert.match(filas[4].errores[0], /duplicado de la fila 2/);
        assert.equal(await Event.countDocuments(), 2);
    });

    it('confirmar: crea la nueva y actualiza la cambiada', async () => {
        await prepararImportacion(csvAObjetos(CSV), { confirmar: true });
        assert.equal(await Event.countDocuments(), 3);
        const cambiada = await Event.findOne({ nombre: 'Beca existente cambiada' });
        assert.equal(cambiada.costo, 'S/ 50');
    });

    it('volver a importar lo mismo: todo sin cambios salvo errores', async () => {
        const { resumen } = await prepararImportacion(csvAObjetos(CSV));
        assert.deepEqual(resumen, { crear: 0, actualizar: 0, sin_cambios: 3, error: 2 });
    });
});
