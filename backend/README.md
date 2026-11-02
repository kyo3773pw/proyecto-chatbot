# Backend – chatbot de eventos

API en Express 5 + MongoDB. Por ahora solo usuarios y autenticación. Los eventos y el chatbot se agregan después.

## Requisitos
- Node >= 20.6 (usa `--env-file` y `node:test`).
- Una base MongoDB (local o Atlas).

## Configuración
1. `npm install`
2. Copiar `.env.example` a `.env` y completar. `.env` no se sube al repo.
3. `npm run dev`

## Endpoints
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | no | Chequeo de vida |
| POST | `/api/auth/register` | no | `{ email, password }`. Siempre crea rol `user`. |
| POST | `/api/auth/login` | no | `{ email, password }`. Deja el JWT en cookie `httpOnly`. |
| POST | `/api/auth/logout` | no | Borra la cookie. |
| GET | `/api/auth/me` | sí | Usuario actual (sin hash). |

## Admin
No hay endpoint para volverse admin. Registrar el usuario normalmente y luego:

```
npm run make-admin -- correo@ejemplo.com
```

## Tests
```
npm test
```
Los tests de middleware no necesitan base. Los de la API necesitan `MONGODB_URI_TEST` apuntando a una base cuyo nombre contenga `test` (se borra en cada corrida); si no está definida, se saltan.
