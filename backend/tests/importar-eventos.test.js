import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { csvAObjetos } from '../src/csv.js';
import { filaAEvento } from '../src/importar-eventos.js';
import { Event } from '../src/models/event.model.js';

describe('csvAObjetos', () => {
    it('usa el encabezado como nombres de campo y respeta comas entre comillas', () => {
        const filas = csvAObjetos('nombre,notas\nBeca X,"a, b"\n');
        assert.deepEqual(filas, [{ nombre: 'Beca X', notas: 'a, b' }]);
    });

    it('CSV vacío -> lista vacía, sin error', () => {
        assert.deepEqual(csvAObjetos(''), []);
    });
});

describe('filaAEvento', () => {
    it('quita celdas vacías y espacios', () => {
        assert.deepEqual(filaAEvento({ nombre: ' Beca X ', hora: '', costo: '   ' }), { nombre: 'Beca X' });
    });

    it('pais_elegible pasa a lista', () => {
        assert.deepEqual(filaAEvento({ pais_elegible: 'Perú, Chile,' }).pais_elegible, ['Perú', 'Chile']);
    });

    it('otras_fechas pasa a lista de { descripcion, fecha }, aunque termine en ;', () => {
        assert.deepEqual(filaAEvento({ otras_fechas: 'registro=2026-11-15; envío de artículos = 2026-09-30;' }).otras_fechas, [
            { descripcion: 'registro', fecha: '2026-11-15' },
            { descripcion: 'envío de artículos', fecha: '2026-09-30' },
        ]);
    });
});

describe('CSV real (data/events_seed.csv)', () => {
    const texto = readFileSync(new URL('../../data/events_seed.csv', import.meta.url), 'utf8');

    it('todas las filas cumplen el modelo Event', async () => {
        const filas = csvAObjetos(texto);
        assert.ok(filas.length > 0);
        for (const [i, fila] of filas.entries()) {
            const evento = new Event(filaAEvento(fila));
            await assert.doesNotReject(evento.validate(), `fila ${i + 2} (${fila.nombre}) no cumple el modelo`);
        }
    });
});
