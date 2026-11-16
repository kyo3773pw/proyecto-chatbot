import { dbSkipReason, testDbUri } from './helpers.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';

const { connectDb, disconnectDb } = await import('../src/db.js');
const { Event } = await import('../src/models/event.model.js');
const { armarRespuesta, estadoEvento, eventosVigentes } = await import('../src/chatbot.js');

const fecha = s => new Date(`${s}T00:00:00Z`);

describe('estadoEvento (hoy = 2026-11-10)', () => {
    const hoy = '2026-11-10';
    const casos = [
        ['plazo vencido aunque esté en curso -> cerrada', { fecha_inicio: fecha('2026-11-09'), fecha_fin: fecha('2026-11-13'), fecha_limite: fecha('2026-11-08') }, 'inscripcion_cerrada'],
        ['plazo vencido y aún no empieza -> cerrada', { fecha_inicio: fecha('2026-12-02'), fecha_limite: fecha('2026-11-01') }, 'inscripcion_cerrada'],
        ['ya empezó, sin plazo -> en curso', { fecha_inicio: fecha('2026-11-09'), fecha_fin: fecha('2026-11-13') }, 'en_curso'],
        ['empieza hoy -> en curso', { fecha_inicio: fecha('2026-11-10'), fecha_fin: fecha('2026-11-12') }, 'en_curso'],
        ['plazo vence hoy -> todavía abierta', { fecha_limite: fecha('2026-11-10') }, 'inscripcion_abierta'],
        ['beca con plazo futuro -> abierta', { fecha_limite: fecha('2026-11-13') }, 'inscripcion_abierta'],
        ['futuro sin plazo -> próximo', { fecha_inicio: fecha('2026-12-02'), fecha_fin: fecha('2026-12-05') }, 'proximo'],
    ];
    for (const [nombre, evento, esperado] of casos) {
        it(nombre, () => assert.equal(estadoEvento(evento, hoy), esperado));
    }
});

describe('armarRespuesta (hoy = 2026-11-10)', () => {
    const hoy = '2026-11-10';
    const eventos = [
        { nombre: 'Beca A', type: 'beca', fecha_limite: fecha('2026-11-13'), url_registro: 'https://beca.pe' },
        { nombre: 'Congreso B', type: 'congreso', fecha_inicio: fecha('2026-11-09'), fecha_fin: fecha('2026-11-13'), fecha_limite: fecha('2026-11-08') },
    ];
    const texto = 'Esta beca te puede servir para tu posgrado.';

    it('arma las fichas desde la base, con estado y fechas en AAAA-MM-DD', () => {
        const { texto: t, fichas } = armarRespuesta({ numeros: [1, 2], texto }, eventos, hoy);
        assert.equal(t, texto);
        assert.deepEqual(fichas.map(f => [f.nombre, f.estado]), [['Beca A', 'inscripcion_abierta'], ['Congreso B', 'inscripcion_cerrada']]);
        assert.equal(fichas[0].fecha_limite, '2026-11-13');
        assert.equal(fichas[0].url_registro, 'https://beca.pe');
    });

    it('descarta números repetidos, fuera de rango o que no son enteros', () => {
        const { fichas } = armarRespuesta({ numeros: [1, 1, 0, 99, '2', 2.5], texto }, eventos, hoy);
        assert.deepEqual(fichas.map(f => f.nombre), ['Beca A']);
    });

    it('ningún evento válido -> "no sé" sin fichas, aunque el LLM escriba algo', () => {
        const r = armarRespuesta({ numeros: [99], texto: 'Hay un curso de cocina genial.' }, eventos, hoy);
        assert.match(r.texto, /^No tengo eventos/);
        assert.deepEqual(r.fichas, []);
    });

    const prohibidos = [
        'Postula antes del 13 de noviembre.', 'Cierra el 13/11.', 'Cierra el 2026-11-13.', 'Empieza a las 20:00.',
        'Inscríbete en https://beca.pe', 'Escribe a info@beca.pe', 'Llama al 973 223 574',
    ];
    for (const malo of prohibidos) {
        it(`texto con datos concretos se descarta: "${malo}"`, () => {
            assert.equal(armarRespuesta({ numeros: [1], texto: malo }, eventos, hoy).texto, 'Estos eventos coinciden con tu pregunta:');
        });
    }
});

describe('eventosVigentes', { skip: dbSkipReason }, () => {
    const base = { type: 'otro', ambito: 'nacional', fecha_captura: '2026-10-01', origen: 'real' };

    before(async () => {
        await connectDb(testDbUri);
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map(c => c.deleteMany({})));
        await Event.create([
            { ...base, nombre: 'Termina hoy', fecha_inicio: '2026-11-01', fecha_fin: '2026-11-10' },
            { ...base, nombre: 'Terminó ayer', fecha_inicio: '2026-11-01', fecha_fin: '2026-11-09' },
            { ...base, nombre: 'Beca abierta', type: 'beca', fecha_limite: '2026-11-13' },
            { ...base, nombre: 'Beca vencida', type: 'beca', fecha_limite: '2026-10-18' },
            { ...base, nombre: 'Futuro', fecha_inicio: '2026-12-02', fecha_fin: '2026-12-05' },
        ]);
    });
    after(async () => {
        try {
            const collections = await mongoose.connection.db.collections();
            await Promise.all(collections.map(c => c.deleteMany({})));
        } finally {
            await disconnectDb();
        }
    });

    it('hoy = 2026-11-10: solo los vigentes, incluido el que termina hoy', async () => {
        const nombres = (await eventosVigentes('2026-11-10')).map(e => e.nombre).sort();
        assert.deepEqual(nombres, ['Beca abierta', 'Futuro', 'Termina hoy']);
    });

    it('con un hoy en el pasado, los eventos viejos vuelven a estar vigentes', async () => {
        const nombres = (await eventosVigentes('2026-10-01')).map(e => e.nombre).sort();
        assert.deepEqual(nombres, ['Beca abierta', 'Beca vencida', 'Futuro', 'Termina hoy', 'Terminó ayer']);
    });
});
