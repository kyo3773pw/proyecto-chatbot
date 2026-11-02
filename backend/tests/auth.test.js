import { dbSkipReason, testDbUri } from './helpers.js';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import request from 'supertest';

const { createApp } = await import('../src/app.js');
const { connectDb, disconnectDb } = await import('../src/db.js');

describe('API de auth', { skip: dbSkipReason }, () => {
    const app = createApp();
    const cred = { email: 'Ana@Ejemplo.com', password: 'una-clave-larga' };

    // Vacía colecciones en vez de dropDatabase: el rol readWriteAnyDatabase de Atlas no permite borrar bases.
    async function clearDb() {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map(c => c.deleteMany({})));
    }

    before(async () => {
        await connectDb(testDbUri);
        await clearDb();
    });
    after(async () => {
        try {
            await clearDb();
        } finally {
            await disconnectDb();
        }
    });

    it('register crea user, normaliza email y no devuelve el hash', async () => {
        const res = await request(app).post('/api/auth/register').send({ ...cred, role: 'admin' });
        assert.equal(res.status, 201);
        assert.equal(res.body.user.email, 'ana@ejemplo.com');
        assert.equal(res.body.user.role, 'user');
        assert.equal(res.body.user.passwordHash, undefined);
        assert.match(res.headers['set-cookie'][0], /HttpOnly/);
    });

    it('register duplicado -> 409', async () => {
        const res = await request(app).post('/api/auth/register').send(cred);
        assert.equal(res.status, 409);
    });

    it('register con datos inválidos -> 400', async () => {
        const res = await request(app).post('/api/auth/register').send({ email: 'x', password: '1' });
        assert.equal(res.status, 400);
    });

    it('login con contraseña incorrecta o email inexistente -> 401 con el mismo mensaje', async () => {
        const a = await request(app).post('/api/auth/login').send({ ...cred, password: 'otra-clave' });
        const b = await request(app).post('/api/auth/login').send({ email: 'nadie@ejemplo.com', password: 'x' });
        assert.equal(a.status, 401);
        assert.equal(b.status, 401);
        assert.equal(a.body.error, b.body.error);
    });

    it('login correcto + me devuelve el usuario sin hash', async () => {
        const agent = request.agent(app);
        const login = await agent.post('/api/auth/login').send(cred);
        assert.equal(login.status, 200);
        const me = await agent.get('/api/auth/me');
        assert.equal(me.status, 200);
        assert.equal(me.body.user.email, 'ana@ejemplo.com');
        assert.equal(me.body.user.passwordHash, undefined);
    });

    it('me con token inválido -> 401', async () => {
        const res = await request(app).get('/api/auth/me').set('Cookie', 'token=basura');
        assert.equal(res.status, 401);
    });

    it('logout borra la cookie', async () => {
        const agent = request.agent(app);
        await agent.post('/api/auth/login').send(cred);
        await agent.post('/api/auth/logout').expect(204);
        await agent.get('/api/auth/me').expect(401);
    });
});
