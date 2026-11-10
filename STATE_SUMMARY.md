# Estado del proyecto (2026-11-09)

Chatbot con RAG para eventos universitarios (congresos, becas, cursos). Rework del repo kyo3773pw/proyecto-chatbot en carpeta nueva.

## Hecho
- **Backend** (`backend/`): Express 5 + MongoDB Atlas (M0). Auth con JWT en cookie httpOnly, roles user/admin, secretos en `.env`.
- **Modelo Event** con reglas por tipo (beca: fecha_limite; congreso y curso: fechas del evento).
- **Admin**: `POST/GET /api/admin/events` y carga CSV con vista previa (`/admin.html`). Spec: `specs/carga-csv.md` (hecho).
- **Datos**: 17 eventos reales en la base (`chatbot_eventos`), 4 becas, 8 vencidos al 2026-11-09.
- **Tests**: 52, con `npm.cmd test` en `backend/` (usa la base `chatbot_eventos_test`; los del LLM simulan la API y no gastan cuota).

## Pendiente (en orden)
1. Carga por texto pegado con LLM (`specs/carga-texto-llm.md`, en curso). Hecho: clave Gemini en `.env` (`gemini-3.5-flash-lite`, 500 solicitudes/día), `src/llm.js` (`extraerEvento`), `src/verificar-extraccion.js` (`camposNoEncontrados`), con tests. Falta: endpoint `POST /api/admin/events/extract` (traducir `LlmError` en `error.js`), formulario de revisión en `admin.html`, prueba real.
2. Formulario de un solo evento y sugerencias de usuarios (specs futuros).
3. Punto 3: filtro por fecha de referencia, redacción con LLM + verificación, set de ~30 preguntas.
4. Decidir tipos `seminario` y `movilidad`. Meta de datos: ~40 reales, ≥5 becas.
5. Completar `fuente_url` de 10 eventos (posts de LinkedIn/Facebook que solo tiene el usuario); pospuesto. El modelo no la exige.

Retirado: `data/validate_events.mjs` (2026-11-09); la vista previa de `/admin.html` valida con las reglas del modelo. Está en el historial de git (commit bf4b5be).

## Entorno
- Node portable: `F:\RESPALDO\herramientas-portables\node\node-v24.21.0-win-x64` (agregar al PATH en cada terminal; usar `npm.cmd`, PowerShell bloquea `npm.ps1`).
- Atlas pausa el cluster por inactividad: si hay timeouts, Resume en Atlas.
- Rotar la key de Hugging Face del repo original (pendiente del usuario).
