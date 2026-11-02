import './helpers.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const { requireAuth, requireRole, isOwnerOrAdmin } = await import('../src/middlewares/auth.js');

function fakeRes() {
    return {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

describe('requireAuth', () => {
    it('sin cookie -> 401 y no llama next', async () => {
        const res = fakeRes();
        let called = false;
        await requireAuth({ cookies: {} }, res, () => { called = true; });
        assert.equal(res.statusCode, 401);
        assert.equal(called, false);
    });

    it('token inválido -> 401 y no llama next', async () => {
        const res = fakeRes();
        let called = false;
        await requireAuth({ cookies: { token: 'no-es-un-jwt' } }, res, () => { called = true; });
        assert.equal(res.statusCode, 401);
        assert.equal(called, false);
    });
});

describe('requireRole', () => {
    it('user en ruta de admin -> 403', () => {
        const res = fakeRes();
        let called = false;
        requireRole('admin')({ user: { role: 'user' } }, res, () => { called = true; });
        assert.equal(res.statusCode, 403);
        assert.equal(called, false);
    });

    it('admin en ruta de admin -> next', () => {
        let called = false;
        requireRole('admin')({ user: { role: 'admin' } }, fakeRes(), () => { called = true; });
        assert.equal(called, true);
    });
});

describe('isOwnerOrAdmin', () => {
    it('solo dueño o admin', () => {
        assert.equal(isOwnerOrAdmin({ _id: 'a', role: 'user' }, 'a'), true);
        assert.equal(isOwnerOrAdmin({ _id: 'b', role: 'user' }, 'a'), false);
        assert.equal(isOwnerOrAdmin({ _id: 'b', role: 'admin' }, 'a'), true);
    });
});
