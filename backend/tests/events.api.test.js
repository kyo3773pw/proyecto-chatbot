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

const URL = '/api/admin/events';
const beca = { nombre: 'Beca de prueba', type: 'beca', ambito: 'nacional', fecha_limite: '2026-12-01', fecha_captura: '2026-11-05', origen: 'sintetico' };

describe('API de eventos (admin)', { skip: dbSkipReason }, () => {
    const app = createApp();
    const admin = request.agent(app);
    const user = request.agent(app);

    async function clearDb() {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map(c => c.deleteMany({})));
    }

    // Crea el usuario directo en la base (no hay endpoint para ser admin) y deja su sesión en el agente.
    async function loginAs(agent, email, role) {
        const passwordHash = await bcrypt.hash('clave-de-prueba', 4);
        await User.create({ email, passwordHash, role });
        await agent.post('/api/auth/login').send({ email, password: 'clave-de-prueba' }).expect(200);
    }

    before(async () => {
        await connectDb(testDbUri);
        await clearDb();
        await Event.init(); // espera a que exista el índice único antes de probar duplicados
        await loginAs(admin, 'admin@prueba.com', 'admin');
        await loginAs(user, 'user@prueba.com', 'user');
    });
    after(async () => {
        try {
            await clearDb();
        } finally {
            await disconnectDb();
        }
    });

    it('sin sesión -> 401', async () => {
        await request(app).get(URL).expect(401);
    });

    it('usuario normal -> 403', async () => {
        await user.post(URL).send(beca).expect(403);
    });

    it('admin crea un evento válido -> 201 e ignora _id del cliente', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await admin.post(URL).send({ ...beca, _id: fakeId }).expect(201);
        assert.equal(res.body.event.nombre, beca.nombre);
        assert.notEqual(res.body.event._id, fakeId);
    });

    it('mismo nombre y fecha_inicio -> 409', async () => {
        await admin.post(URL).send(beca).expect(409);
    });

    it('evento inválido -> 400 con los campos', async () => {
        // Sin fecha_limite falla la regla de beca y también la de "fecha_fin o fecha_limite".
        const res = await admin.post(URL).send({ ...beca, nombre: 'Otra beca', fecha_limite: undefined }).expect(400);
        assert.deepEqual(res.body.detalles.map(d => d.campo).sort(), ['fecha_fin', 'fecha_limite']);
    });

    it('POST sin cuerpo -> 400, no 500', async () => {
        await admin.post(URL).expect(400);
    });

    it('admin lista los eventos', async () => {
        const res = await admin.get(URL).expect(200);
        assert.equal(res.body.events.length, 1);
    });

    describe('POST /import', () => {
        const IMPORT = `${URL}/import`;
        const csv = 'nombre,type,ambito,fecha_limite,fecha_captura,origen\nBeca importada,beca,nacional,2026-12-01,2026-11-09,real\n';

        it('usuario normal -> 403', async () => {
            await user.post(IMPORT).send({ csv }).expect(403);
        });

        it('sin csv o csv que no es texto -> 400', async () => {
            await admin.post(IMPORT).send({}).expect(400);
            await admin.post(IMPORT).send({ csv: 123 }).expect(400);
        });

        it('vista previa y confirmar "true" como texto no guardan', async () => {
            const previa = await admin.post(IMPORT).send({ csv }).expect(200);
            assert.equal(previa.body.informe.resumen.crear, 1);
            await admin.post(IMPORT).send({ csv, confirmar: 'true' }).expect(200);
            assert.equal(await Event.countDocuments({ nombre: 'Beca importada' }), 0);
        });

        it('confirmar: true guarda', async () => {
            await admin.post(IMPORT).send({ csv, confirmar: true }).expect(200);
            assert.equal(await Event.countDocuments({ nombre: 'Beca importada' }), 1);
        });
    });

    describe('POST /extract', () => {
        const EXTRACT = `${URL}/extract`;
        const texto = 'Taller de Python el 5 de diciembre en el Auditorio Central.';
        // Simula a Gemini (no usa red ni cuota). El LLM "inventa" un enlace que no está en el texto.
        const simularGemini = (status, obj) => mock.method(globalThis, 'fetch', async () => new Response(
            JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] }), { status }));
        afterEach(() => mock.restoreAll());

        it('usuario normal -> 403', async () => {
            await user.post(EXTRACT).send({ texto }).expect(403);
        });

        it('texto vacío o demasiado largo -> 400', async () => {
            await admin.post(EXTRACT).send({ texto: '  ' }).expect(400);
            await admin.post(EXTRACT).send({ texto: 'x'.repeat(10_001) }).expect(400);
        });

        it('devuelve el evento con valores por defecto y marca lo que no está en el texto', async () => {
            simularGemini(200, { nombre: 'Taller de Python', type: 'curso_extracurricular', fecha_inicio: '2026-12-05', hora: '', url_registro: 'https://inventado.pe' });
            const res = await admin.post(EXTRACT).send({ texto }).expect(200);
            assert.equal(res.body.evento.nombre, 'Taller de Python');
            assert.equal(res.body.evento.origen, 'real');
            assert.match(res.body.evento.fecha_captura, /^\d{4}-\d{2}-\d{2}$/);
            assert.equal(res.body.evento.hora, undefined); // campo vacío del LLM -> ausente
            assert.deepEqual(res.body.sospechosos, ['url_registro']);
            assert.equal(await Event.countDocuments({ nombre: 'Taller de Python' }), 0); // no guarda
        });

        it('LLM caído -> 502 con mensaje claro', async () => {
            simularGemini(500, {});
            const res = await admin.post(EXTRACT).send({ texto }).expect(502);
            assert.match(res.body.error, /LLM/);
        });
    });
});
