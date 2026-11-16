# Chatbot de eventos
Estado: hecho (2026-11-16). API: `POST /api/chat` `{ pregunta, hoy? }` → `{ texto, fichas, hoy }`. Página: /chat.html. Evaluación: `npm run eval`, 30/32 (94 %).
Cambios respecto de lo acordado: un mensaje que es solo un saludo o agradecimiento recibe una respuesta fija sin llamar al LLM (2026-11-16); sin eventos vigentes no se llama al LLM; `hoy` se valida con ida y vuelta (Date acepta "2026-02-30"); pregunta máx. 500 caracteres. Fallas conocidas: el LLM a veces omite eventos relevantes cuyo nombre no usa las palabras de la pregunta (caso #12).

**Problema:** un estudiante con sesión pregunta en lenguaje natural ("¿hay becas abiertas?") y recibe los eventos vigentes que responden, sin fechas ni enlaces inventados.

**Ejemplos (con hoy = 2026-11-10):**
1. "¿Qué becas puedo postular?" → texto breve + ficha de Beca Generación del Bicentenario (inscripción abierta hasta el 13/11, enlace oficial).
2. "¿Hay congresos en Puno?" → fichas de los congresos vigentes en Puno; un congreso vigente con inscripción vencida dice "inscripción cerrada".
3. "¿Hay cursos de cocina?" → "No tengo eventos que coincidan con tu pregunta", sin fichas.

**Reglas:**
- Solo usuarios con sesión. `hoy` es un parámetro opcional (AAAA-MM-DD; por defecto, hoy en hora de Perú).
- Recuperación por código: vigentes = `fecha_fin ≥ hoy`, o `fecha_limite ≥ hoy` si no hay `fecha_fin`. Todos van al prompt (sin embeddings mientras haya < ~500 eventos).
- El LLM solo elige eventos (por número) y escribe un texto breve sin fechas ni enlaces. Si el texto trae fechas o enlaces, se descarta y quedan solo las fichas.
- Fechas, enlaces y estado ("inscripción abierta hasta…", "inscripción cerrada", "en curso") los arma el código desde la base.
- Ningún evento elegido → mensaje fijo de "no sé".

**Interfaz:** `chat.html` en HTML/CSS/JS sin framework, servida por Express: burbujas, fichas por evento, estado con color, usable en celular y en modo oscuro.

**Fuera de alcance:** conversación con memoria, preguntas sobre eventos pasados respecto de `hoy`, front en React, sugerencias de usuarios.

**Listo cuando:**
- Tests con el LLM simulado: filtro de vigentes por `hoy`, estado "inscripción cerrada", texto con fecha descartado, "no sé" sin eventos, sin sesión → 401.
- `data/evaluacion.json` con ~30 preguntas (con su `hoy` y los eventos esperados) y `npm run eval` que reporta aciertos comparando los eventos elegidos.
- Pregunto desde `chat.html` en el navegador y veo fichas correctas.
