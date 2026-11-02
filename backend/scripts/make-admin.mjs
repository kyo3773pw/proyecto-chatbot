// Uso: npm run make-admin -- correo@ejemplo.com
// Promueve a admin un usuario ya registrado. No maneja contraseñas: el usuario se registra antes por /api/auth/register.
import { connectDb, disconnectDb } from '../src/db.js';
import { User } from '../src/models/user.model.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
    console.error('Uso: npm run make-admin -- correo@ejemplo.com');
    process.exit(1);
}

await connectDb(process.env.MONGODB_URI);
try {
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' });
    if (!user) {
        console.error(`No existe un usuario con email ${email}. Regístralo primero.`);
        process.exitCode = 1;
    } else {
        console.log(`${user.email} ahora es admin.`);
    }
} finally {
    await disconnectDb();
}
