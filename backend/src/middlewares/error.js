import { config } from '../config.js';

export function notFound(req, res) {
    res.status(404).json({ error: 'No encontrado' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Cuerpo demasiado grande' });

    console.error(err);
    res.status(500).json({ error: 'Error interno', ...(config.isProduction ? {} : { detalle: err.message }) });
}
