# Backend – chatbot de eventos

API en Express 5 + MongoDB con un chatbot (RAG simple) sobre eventos universitarios: congresos, becas y cursos.

## Cómo responde el chatbot
1. **Recupera** de la base los eventos vigentes a la fecha `hoy` (sin embeddings: con pocos cientos de eventos, todos caben en el prompt).
2. El **LLM elige** cuáles responden la pregunta y escribe un texto breve, sin fechas ni enlaces.
3. El **código arma las fichas** (fechas, enlaces, estado de inscripción) desde la base. Si el texto del LLM trae fechas, enlaces o teléfonos, se descarta. Si no elige ninguno, responde "no tengo eventos que coincidan".

## Requisitos
- Node >= 20.6 (usa `--env-file` y `node:test`).
- Una base MongoDB (local o Atlas).
- Una clave de Gemini (Google AI Studio) para el chat y para extraer eventos desde texto. Sin ella, la app arranca y esas dos funciones responden "LLM no configurado".

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

## Chat
`http://localhost:3000/chat.html` (cualquier usuario con sesión). En "Opciones de prueba" se puede fijar otra fecha `hoy` para probar con eventos pasados.

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
| POST | `/api/chat` | sí | `{ pregunta, hoy? }` (`hoy` = AAAA-MM-DD, por defecto hoy en Perú). Devuelve `{ texto, fichas, hoy }`. |

## Tests
```
npm test
```
- Los de middleware, modelo, CSV y LLM no necesitan base ni clave: el LLM se simula, no se gasta cuota.
- Los de la API necesitan `MONGODB_URI_TEST` apuntando a una base cuyo nombre contenga `test` (se vacía en cada corrida); si no está definida, se saltan.

## Evaluación del chatbot
```
npm run eval            # todos los casos de ../data/evaluacion.json
npm run eval -- 12 23   # solo algunos casos
```
Usa la base real (solo lectura) y Gemini real: ~30 solicitudes por corrida. Compara los eventos elegidos con los esperados de cada caso. Resultado al 2026-11-16: 30/32 (94 %); las fallas conocidas están anotadas en `_nota`.

## Decisiones
Ver `../specs/` (qué se acordó en cada función) y `../STATE_SUMMARY.md` (estado y pendientes).
