import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/user.model.js';

export const TOKEN_COOKIE = 'token';

// Token ausente, inválido, vencido o de un usuario que ya no existe -> 401. Nunca next() sin usuario.
export async function requireAuth(req, res, next) {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) return res.status(401).json({ error: 'No autenticado' });

    let payload;
    try {
        payload = jwt.verify(token, config.jwtSecret);
    } catch {
        return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    req.user = user;
    next();
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'No autenticado' });
        if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Sin permiso' });
        next();
    };
}

// Para recursos con dueño: solo el dueño o un admin.
export function isOwnerOrAdmin(user, ownerId) {
    return user.role === 'admin' || String(ownerId) === String(user._id);
}
