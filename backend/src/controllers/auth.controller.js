import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { TOKEN_COOKIE } from '../middlewares/auth.js';
import { User } from '../models/user.model.js';

const BCRYPT_ROUNDS = 12;
// Se compara contra este hash cuando el email no existe, para que el tiempo de respuesta no lo delate.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', BCRYPT_ROUNDS);

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    path: '/',
};

function setSession(res, user) {
    const token = jwt.sign({ sub: user._id.toString() }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    res.cookie(TOKEN_COOKIE, token, cookieOptions);
}

export async function register(req, res) {
    const { email, password } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ error: 'El email ya está registrado' });

    // El rol nunca viene del cliente: todo registro es 'user'.
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ email, passwordHash, role: 'user' });

    setSession(res, user);
    res.status(201).json({ user });
}

export async function login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ error: 'Email o contraseña incorrectos' });

    setSession(res, user);
    res.json({ user });
}

export function logout(req, res) {
    res.clearCookie(TOKEN_COOKIE, cookieOptions);
    res.status(204).end();
}

export function me(req, res) {
    res.json({ user: req.user });
}
