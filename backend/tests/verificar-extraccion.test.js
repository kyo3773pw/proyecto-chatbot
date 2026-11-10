import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { camposNoEncontrados } from '../src/verificar-extraccion.js';

const CONALL = `CONALL PUNO 2026
📅 Del 9 al 13 de noviembre
📍 Auditorio Magno, UNA Puno
Informes e inscripciones: Facultad de Ciencias de la Educación – 973 223 574
Inscríbete en https://forms.gle/AbC123`;

// Lo que el LLM devolvió para este texto (paso 2), con el enlace agregado al texto de prueba.
const extraido = {
    nombre: 'CONALL PUNO 2026',
    fecha_inicio: '2026-11-09',
    fecha_fin: '2026-11-13',
    contacto: 'Facultad de Ciencias de la Educación – 973 223 574',
    url_registro: 'https://forms.gle/AbC123',
};

describe('camposNoEncontrados', () => {
    it('extracción fiel al texto -> nada sospechoso', () => {
        assert.deepEqual(camposNoEncontrados(extraido, CONALL), []);
    });

    it('enlace, teléfono y fecha inventados -> se marcan', () => {
        const inventado = { ...extraido, url_registro: 'https://conall.pe/registro', contacto: '951 000 111', fecha_limite: '2026-11-05' };
        assert.deepEqual(camposNoEncontrados(inventado, CONALL), ['url_registro', 'contacto', 'fecha_limite']);
    });

    it('teléfono escrito sin espacios en el texto también cuenta', () => {
        assert.deepEqual(camposNoEncontrados({ contacto: '973 223 574' }, 'Llamar al 973223574'), []);
    });

    it('"setiembre" (forma usada en Perú) cuenta para el mes 9', () => {
        assert.deepEqual(camposNoEncontrados({ fecha_inicio: '2026-09-15' }, 'Inicia el 15 de setiembre'), []);
    });

    it('día con cero adelante: "05 de diciembre" y "05/12"', () => {
        assert.deepEqual(camposNoEncontrados({ fecha_inicio: '2026-12-05' }, 'Sábado 05 de diciembre'), []);
        assert.deepEqual(camposNoEncontrados({ fecha_inicio: '2026-12-05' }, 'Fecha: 05/12'), []);
    });

    it('el día suelto no basta si el mes no aparece', () => {
        assert.deepEqual(camposNoEncontrados({ fecha_inicio: '2026-12-05' }, 'Taller el 5 de noviembre'), ['fecha_inicio']);
    });
});
