# Chatbot de eventos universitarios

Chatbot que responde en lenguaje natural sobre congresos, becas y cursos vigentes para estudiantes universitarios de Perú. Usa RAG (recuperación + generación) sobre una base de eventos cargada y revisada por un admin, con una regla central: **las fechas y los enlaces que ve el estudiante salen de la base, nunca del LLM**.

## Cómo funciona

```
pregunta ──► 1. Recuperar (código)   eventos vigentes a la fecha "hoy" en MongoDB
          ──► 2. Elegir (LLM)        qué eventos responden la pregunta + texto breve sin fechas ni enlaces
          ──► 3. Armar (código)      fichas con fechas, enlaces y estado de inscripción desde la base
```

- Si el LLM no elige ningún evento, responde "no tengo eventos que coincidan" en vez de inventar.
- Si el texto del LLM trae fechas, enlaces o teléfonos, se descarta.
- El estado ("inscripción abierta hasta…", "inscripción cerrada", "en curso") lo calcula el código.

## Qué incluye

- **Chat** (`/chat.html`) para usuarios con sesión.
- **Panel de admin** (`/admin.html`): carga de eventos por CSV con vista previa, formulario manual y extracción desde el texto de un post con Gemini, marcando los datos que no aparecen en el texto para revisarlos antes de guardar.
- **Evaluación**: 33 preguntas con respuesta esperada (`data/evaluacion.json`) y `npm run eval`.
- **Tests** con `node:test` (el LLM se simula: no gastan cuota).

## Tecnología

Node 20+ · Express 5 · MongoDB (Atlas) con Mongoose · Gemini (Flash-Lite) vía `fetch` · HTML/CSS/JS sin framework. Auth con JWT en cookie `httpOnly`.

## Empezar

```
cd backend
npm install
cp .env.example .env   # completar MONGODB_URI, JWT_SECRET, GEMINI_API_KEY…
npm run dev            # http://localhost:3000/chat.html
```

Detalles (endpoints, primer admin, tests): [`backend/README.md`](backend/README.md).

## Estructura

| Carpeta / archivo | Qué hay |
|---|---|
| `backend/` | API, páginas (`public/`), tests y scripts |
| `data/` | `events_seed.csv` (eventos reales), `evaluacion.json` y formato del CSV |
| `specs/` | Qué se acordó en cada función antes de programarla |
| `STATE_SUMMARY.md` | Estado actual y pendientes |
| `COMO_TRABAJAR.md` | Recetas del día a día (correr, cargar, probar, deshacer) |

## Estado

Funciona de punta a punta con 18 eventos reales. Pendientes en [`STATE_SUMMARY.md`](STATE_SUMMARY.md).

> Esta versión reemplaza al prototipo anterior del repositorio (MERN con tareas de tutorial y un chatbot que no llegó a funcionar).
