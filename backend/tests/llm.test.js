import './helpers.js';
import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

const { config } = await import('../src/config.js');
const { extraerEvento } = await import('../src/llm.js');

// Simula la respuesta de Gemini: nunca se llama a la red real ni se gasta cuota.
function simularGemini(status, cuerpo) {
    mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(cuerpo), { status }));
}
const respuestaCon = obj => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] });

describe('extraerEvento', () => {
    config.geminiApiKey ||= 'clave-de-prueba';
    config.llmModel ||= 'modelo-de-prueba';
    afterEach(() => mock.restoreAll());

    it('devuelve los campos que propone el LLM', async () => {
        simularGemini(200, respuestaCon({ nombre: 'Taller', fecha_inicio: '2026-12-05' }));
        assert.deepEqual(await extraerEvento('Taller el 5 de diciembre', '2026-11-09'), { nombre: 'Taller', fecha_inicio: '2026-12-05' });
    });

    it('límite agotado -> LlmError 429', async () => {
        simularGemini(429, {});
        await assert.rejects(extraerEvento('x', '2026-11-09'), { name: 'LlmError', status: 429 });
    });

    it('error del proveedor o respuesta que no es JSON -> LlmError 502', async () => {
        simularGemini(500, {});
        await assert.rejects(extraerEvento('x', '2026-11-09'), { name: 'LlmError', status: 502 });
        simularGemini(200, { candidates: [{ content: { parts: [{ text: 'no es json' }] } }] });
        await assert.rejects(extraerEvento('x', '2026-11-09'), { name: 'LlmError', status: 502 });
    });

    it('sin clave -> LlmError 503, sin llamar a la red', async () => {
        const clave = config.geminiApiKey;
        config.geminiApiKey = undefined;
        const fetchFalso = mock.method(globalThis, 'fetch');
        try {
            await assert.rejects(extraerEvento('x', '2026-11-09'), { name: 'LlmError', status: 503 });
            assert.equal(fetchFalso.mock.callCount(), 0);
        } finally {
            config.geminiApiKey = clave;
        }
    });
});
