// Lee y valida las variables de entorno al arrancar. Sin valores por defecto para secretos.

function required(name) {
    const value = process.env[name];
    if (!value) throw new Error(`Falta la variable de entorno ${name}`);
    return value;
}

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres');

export const config = {
    port: Number(process.env.PORT) || 3000,
    isProduction: process.env.NODE_ENV === 'production',
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    corsOrigin: required('CORS_ORIGIN'),
};
