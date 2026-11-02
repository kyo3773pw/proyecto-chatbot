// Valores solo para tests; config.js los exige al importarse.
process.env.JWT_SECRET ||= 'test-secret-solo-para-tests-0123456789abcdef';
process.env.CORS_ORIGIN ||= 'http://localhost:5173';

export const testDbUri = process.env.MONGODB_URI_TEST;
// Evita borrar una base real por error: el nombre de la base debe contener "test".
export const dbSkipReason = !testDbUri
    ? 'MONGODB_URI_TEST no definida'
    : !/test/i.test(new URL(testDbUri).pathname)
        ? 'el nombre de la base en MONGODB_URI_TEST debe contener "test"'
        : false;
