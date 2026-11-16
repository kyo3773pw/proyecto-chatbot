import { dbSkipReason, testDbUri } from './helpers.js';
import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it, mock } from 'node:test';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import request from 'supertest';

const { createApp } = await import('../src/app.js');
const { connectDb, disconnectDb } = await import('../src/db.js');
const { User } = await import('../src/models/user.model.js');
const { Event } = await import('../src/models/event.model.js');

const URL = '/api/chat';

describe('API del chat', { skip: dbSkipReason }, () => {
    const app = createApp();
    const estudiante = request.agent(app);

    // Simula a Gemini: elige los números dados. Devuelve el mock para contar llamadas.
    const simularGemini = (numeros, texto = 'Esta beca te puede servir.') =>
        mock.method(globalThis, 'fetch', async () => new Response(
            JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ numeros, texto }) }] } }] }), { status: 200 }));

    async function clearDb() {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map(c => c.deleteMany({})));
    }

    before(async () => {
        await connectDb(testDbUri);
        await clearDb();
        await Event.create({ nombre: 'Beca de prueba', type: 'beca', ambito: 'nacional', fecha_limite: '2026-11-13', fecha_captura: '2026-11-01', origen: 'real' });
        await User.create({ email: 'estudiante@prueba.com', passwordHash: await bcrypt.hash('clave-de-prueba', 4), role: 'user' });
        await estudiante.post('/api/auth/login').send({ email: 'estudiante@prueba.com', password: 'clave-de-prueba' }).expect(200);
    });
    after(async () => {
        try {
            await clearDb();
        } finally {
            await disconnectDb();
        }
    });
    afterEach(() => mock.restoreAll());

    it('sin sesión -> 401', async () => {
        await request(app).post(URL).send({ pregunta: '¿Hay becas?' }).expect(401);
    });

    it('pregunta vacía, muy larga, o "hoy" inválido -> 400', async () => {
        await estudiante.post(URL).send({ pregunta: '  ' }).expect(400);
        await estudiante.post(URL).send({ pregunta: 'x'.repeat(501) }).expect(400);
        await estudiante.post(URL).send({ pregunta: '¿Hay becas?', hoy: '10/11/2026' }).expect(400);
        await estudiante.post(URL).send({ pregunta: '¿Hay becas?', hoy: '2026-02-30' }).expect(400);
    });

    it('el mensaje de pregunta larga dice el máximo', async () => {
        const res = await estudiante.post(URL).send({ pregunta: 'x'.repeat(501) }).expect(400);
        assert.match(res.body.error, /500/);
    });

    it('usuario normal (no admin) recibe texto y fichas con el estado', async () => {
        simularGemini([1]);
        const res = await estudiante.post(URL).send({ pregunta: '¿Hay becas?', hoy: '2026-11-10' }).expect(200);
        assert.equal(res.body.hoy, '2026-11-10');
        assert.equal(res.body.texto, 'Esta beca te puede servir.');
        assert.deepEqual(res.body.fichas.map(f => [f.nombre, f.estado]), [['Beca de prueba', 'inscripcion_abierta']]);
    });

    it('sin "hoy" usa la fecha de hoy y responde 200', async () => {
        simularGemini([]);
        const res = await estudiante.post(URL).send({ pregunta: '¿Hay becas?' }).expect(200);
        assert.match(res.body.hoy, /^\d{4}-\d{2}-\d{2}$/);
    });

    it('sin eventos vigentes -> "no sé" sin llamar al LLM', async () => {
        const fetchFalso = simularGemini([1]);
        const res = await estudiante.post(URL).send({ pregunta: '¿Hay becas?', hoy: '2030-01-01' }).expect(200);
        assert.match(res.body.texto, /^No tengo eventos/);
        assert.equal(fetchFalso.mock.callCount(), 0);
    });
});
