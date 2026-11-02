import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Event } from '../src/models/event.model.js';

// validate() no necesita conexión a Mongo: devuelve los campos con error ([] si es válido).
async function camposConError(datos) {
    try {
        await new Event(datos).validate();
        return [];
    } catch (err) {
        return Object.keys(err.errors).sort();
    }
}

const base = { ambito: 'nacional', fecha_captura: '2026-10-29', origen: 'real' };

describe('Event: eventos reales válidos', () => {
    it('curso LACIMA', async () => {
        assert.deepEqual(await camposConError({
            ...base, nombre: 'Semana de LACIMA', type: 'curso_extracurricular', ambito: 'universidad',
            modalidad: 'virtual', fecha_inicio: '2026-11-09', fecha_fin: '2026-11-13', hora: '20:00',
            fecha_limite: '2026-11-08', url_registro: 'https://lacima.edu.pe/en/forms/semanadelacima',
        }), []);
    });

    it('congreso con otras_fechas', async () => {
        assert.deepEqual(await camposConError({
            ...base, nombre: 'ICICCDS 2027', type: 'congreso', ambito: 'internacional',
            fecha_inicio: '2027-01-25', fecha_fin: '2027-01-26', fecha_limite: '2026-09-30',
            otras_fechas: [{ descripcion: 'registro', fecha: '2026-11-15' }],
        }), []);
    });

    it('beca solo con fecha_limite', async () => {
        assert.deepEqual(await camposConError({ ...base, nombre: 'Beca X', type: 'beca', fecha_limite: '2026-12-01' }), []);
    });
});

describe('Event: reglas que deben rechazar', () => {
    const curso = { ...base, nombre: 'Curso', type: 'curso_extracurricular', modalidad: 'virtual', fecha_inicio: '2026-11-01', fecha_fin: '2026-11-30' };

    it('beca sin fecha_limite', async () => {
        assert.deepEqual(await camposConError({ ...base, nombre: 'Beca', type: 'beca', fecha_fin: '2026-12-01' }), ['fecha_limite']);
    });
    it('curso sin modalidad', async () => {
        assert.deepEqual(await camposConError({ ...curso, modalidad: undefined }), ['modalidad']);
    });
    it('fecha_fin antes de fecha_inicio', async () => {
        assert.deepEqual(await camposConError({ ...curso, fecha_fin: '2026-10-01' }), ['fecha_fin']);
    });
    it('sin fecha_fin ni fecha_limite', async () => {
        assert.deepEqual(await camposConError({ ...base, nombre: 'Otro', type: 'otro' }), ['fecha_fin']);
    });
    it('fecha_limite después de fecha_fin, aunque no haya fecha_inicio', async () => {
        assert.deepEqual(await camposConError({ ...base, nombre: 'Beca', type: 'beca', fecha_fin: '2026-05-15', fecha_limite: '2026-06-01' }), ['fecha_limite']);
    });
    it('hora y enlaces con formato inválido', async () => {
        assert.deepEqual(await camposConError({ ...curso, hora: '7pm', url_registro: 'javascript:alert(1)', fuente_url: 'ftp://x' }), ['fuente_url', 'hora', 'url_registro']);
    });
    it('type fuera de la lista', async () => {
        assert.deepEqual(await camposConError({ ...curso, type: 'seminario' }), ['type']);
    });
});
