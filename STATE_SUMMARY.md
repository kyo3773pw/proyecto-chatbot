# Estado del proyecto (2026-11-16)

Chatbot con RAG para eventos universitarios (congresos, becas, cursos). Rework del repo kyo3773pw/proyecto-chatbot en carpeta nueva.

## Hecho
- **Backend** (`backend/`): Express 5 + MongoDB Atlas (M0). Auth con JWT en cookie httpOnly, roles user/admin, secretos en `.env`.
- **Modelo Event** con reglas por tipo (beca: fecha_limite; congreso y curso: fechas del evento).
- **Admin** (`/admin.html`): carga CSV con vista previa (`specs/carga-csv.md`) y formulario de un evento con extracción desde texto por Gemini + verificación contra el texto (`specs/carga-texto-llm.md`).
- **Chatbot** (`/chat.html`, `POST /api/chat`, `specs/chatbot.md`): recupera vigentes por fecha, el LLM elige y redacta sin fechas, el código arma las fichas. Evaluación: 30/32 (94 %) con `npm run eval`.
- **LLM**: `gemini-3.5-flash-lite` (500 solicitudes/día gratis), vía `fetch`; clave en `.env`. Responde a veces 503 (sobrecarga): reintentar.
- **Datos**: 18 eventos reales en la base (`chatbot_eventos`), 4 becas.
- **Tests**: 88, con `npm.cmd test` en `backend/` (usa la base `chatbot_eventos_test`; los del LLM simulan la API y no gastan cuota).
- Recetas de uso sin IA: `COMO_TRABAJAR.md`.
- **Publicado** en https://github.com/kyo3773pw/proyecto-chatbot (rama `main`, 2026-11-16). El prototipo anterior está en las ramas `prototipo-viejo` y `prototipo-viejo-main`. Clave de Hugging Face del prototipo: revocada.

## Pendiente (en orden)
1. Más datos: meta ~40 eventos reales y ≥5 becas (faltan 1 beca y ~22 eventos). Al crecer, ampliar `data/evaluacion.json`.
2. Sugerencias de eventos por usuarios con aprobación del admin (spec futuro).
3. Decidir tipos `seminario` y `movilidad`.
4. Completar `fuente_url` de 10 eventos (posts de LinkedIn/Facebook que solo tiene el usuario); pospuesto.
5. Bootcamp GitHub Agentic AI Developer (Código Facilito/Microsoft): cargar cuando publiquen fechas exactas (https://codigofacilito.com/github-ai-dev).
6. Opcional: borrar/editar eventos desde la página (hoy es manual); embeddings cuando haya ~500 eventos; despliegue.

Retirado: `data/validate_events.mjs` (2026-11-09); la vista previa de `/admin.html` valida con las reglas del modelo. Está en el historial de git (commit 63930c7).

## Entorno
- Node portable: `F:\RESPALDO\herramientas-portables\node\node-v24.21.0-win-x64` (agregar al PATH en cada terminal; usar `npm.cmd`, PowerShell bloquea `npm.ps1`).
- Atlas pausa el cluster por inactividad: si hay timeouts, Resume en Atlas.
