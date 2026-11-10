# Backend – chatbot de eventos

API en Express 5 + MongoDB para cargar y administrar eventos universitarios (congresos, becas, cursos). El chatbot se agrega después.

## Requisitos
- Node >= 20.6 (usa `--env-file` y `node:test`).
- Una base MongoDB (local o Atlas).
- Opcional: una clave de Gemini (Google AI Studio) para extraer eventos desde texto. Sin ella, todo lo demás funciona.

## Configuración
1. `npm install`
2. Copiar `.env.example` a `.env` y completar. `.env` no se sube al repo.
3. `npm run dev` → API en `http://localhost:3000`.

En Windows, si PowerShell bloquea `npm` ("la ejecución de scripts está deshabilitada"), usar `npm.cmd`.

## Primer admin
No hay endpoint para volverse admin. Registrar el usuario (`POST /api/auth/register`) y luego:

```
npm run make-admin -- correo@ejemplo.com
```

## Página de administración
`http://localhost:3000/admin.html` (requiere sesión de admin):
- **Subir CSV**: vista previa fila por fila (crear, actualizar, sin cambios, error) y "Confirmar" para guardar. Formato de columnas en la misma página y en `../data/README.md`.
- **Cargar un evento**: formulario manual, o pegar el texto de un post y "Extraer con LLM". El LLM solo propone; los campos que no aparecen en el texto (enlaces, contactos, fechas) se marcan para revisar, y nada se guarda hasta pulsar "Guardar evento".

## Endpoints
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | no | Chequeo de vida |
| POST | `/api/auth/register` | no | `{ email, password }`. Siempre crea rol `user`. |
| POST | `/api/auth/login` | no | `{ email, password }`. Deja el JWT en cookie `httpOnly`. |
| POST | `/api/auth/logout` | no | Borra la cookie. |
| GET | `/api/auth/me` | sí | Usuario actual (sin hash). |
| GET | `/api/admin/events` | admin | Lista de eventos. |
| POST | `/api/admin/events` | admin | Crea un evento (valida con el modelo `Event`). |
| POST | `/api/admin/events/import` | admin | `{ csv, confirmar }`. Informe por fila; solo guarda si `confirmar === true`. |
| POST | `/api/admin/events/extract` | admin | `{ texto }`. Devuelve `{ evento, sospechosos }` propuestos por el LLM; no guarda. |

## Tests
```
npm test
```
- Los de middleware, modelo, CSV y LLM no necesitan base ni clave: el LLM se simula, no se gasta cuota.
- Los de la API necesitan `MONGODB_URI_TEST` apuntando a una base cuyo nombre contenga `test` (se vacía en cada corrida); si no está definida, se saltan.

## Decisiones
Ver `../specs/` (qué se acordó en cada función) y `../STATE_SUMMARY.md` (estado y pendientes).
