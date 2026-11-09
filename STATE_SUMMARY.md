# Estado del proyecto (2026-11-09)

Chatbot con RAG para eventos universitarios (congresos, becas, cursos). Rework del repo kyo3773pw/proyecto-chatbot en carpeta nueva.

## Hecho
- **Backend** (`backend/`): Express 5 + MongoDB Atlas (M0). Auth con JWT en cookie httpOnly, roles user/admin, secretos en `.env`.
- **Modelo Event** con reglas por tipo (beca: fecha_limite; congreso y curso: fechas del evento).
- **Admin**: `POST/GET /api/admin/events` y carga CSV con vista previa (`/admin.html`). Spec: `specs/carga-csv.md` (hecho).
- **Datos**: 17 eventos reales en la base (`chatbot_eventos`), 4 becas, 8 vencidos al 2026-11-09.
- **Tests**: 42, con `npm.cmd test` en `backend/` (usa la base `chatbot_eventos_test`).

## Pendiente (en orden)
1. Completar `fuente_url` de 10 eventos (posts de LinkedIn/Facebook que solo tiene el usuario).
2. Decidir si se retira `data/validate_events.mjs` (la vista previa ya valida con el modelo).
3. Carga por texto pegado o captura con extracción por LLM y revisión humana (spec nuevo).
4. Formulario de un solo evento y sugerencias de usuarios (specs futuros).
5. Punto 3: filtro por fecha de referencia, redacción con LLM + verificación, set de ~30 preguntas.
6. Decidir tipos `seminario` y `movilidad`. Meta de datos: ~40 reales, ≥5 becas.

## Entorno
- Node portable: `F:\RESPALDO\herramientas-portables\node\node-v24.21.0-win-x64` (agregar al PATH en cada terminal; usar `npm.cmd`, PowerShell bloquea `npm.ps1`).
- Atlas pausa el cluster por inactividad: si hay timeouts, Resume en Atlas.
- Rotar la key de Hugging Face del repo original (pendiente del usuario).
