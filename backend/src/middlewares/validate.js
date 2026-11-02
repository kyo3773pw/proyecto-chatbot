// Valida req.body con un esquema zod y lo reemplaza por el resultado parseado (sin campos extra).
export function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body ?? {});
        if (!result.success) {
            return res.status(400).json({
                error: 'Datos inválidos',
                detalles: result.error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message })),
            });
        }
        req.body = result.data;
        next();
    };
}
