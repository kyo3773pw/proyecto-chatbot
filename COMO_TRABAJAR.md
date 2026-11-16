# Cómo trabajar (sin IA)

Recetas cortas para el día a día. Comandos para PowerShell en Windows.

## Preparar la terminal (cada terminal nueva)
```
$env:Path="F:\RESPALDO\herramientas-portables\node\node-v24.21.0-win-x64;$env:Path"
cd D:\optimizacion\yo\github\chatbot-eventos\backend
```
Usa `npm.cmd` en vez de `npm` (PowerShell bloquea `npm.ps1`). El disco F: debe estar conectado.

## Levantar la app
```
npm.cmd run dev
```
- Chat: http://localhost:3000/chat.html
- Admin: http://localhost:3000/admin.html
- Se reinicia solo al guardar cambios. Detener: Ctrl+C.

## Dar rol de admin a un usuario
1. Registrarlo (o que se registre) con `POST /api/auth/register`.
2. `npm.cmd run make-admin -- correo@ejemplo.com`
3. Salir y volver a entrar en la página.

## Cargar eventos
- **Varios (CSV)**: admin.html → Subir CSV → Vista previa → revisar errores → Confirmar. Formato: tabla en la página y `data/README.md`. Volver a subir el mismo archivo no duplica.
- **Uno desde un post**: admin.html → Cargar un evento → pegar texto → Extraer con LLM → revisar TODO (los campos en naranja no aparecen en el texto: confirmarlos en la fuente o vaciarlos) → pegar `fuente_url` → Guardar.
- **Fechas aproximadas** ("finales de noviembre", "el martes"): no se inventa el día; si no hay fecha exacta, el evento no se carga todavía.

## Corregir o borrar un evento
No hay botón todavía. En Atlas: Data Explorer → Cluster02 → `chatbot_eventos` → `events` → buscar el documento → editar o borrar. Borrar es permanente.

## Probar
```
npm.cmd test          # todos los tests; no gasta cuota del LLM
npm.cmd run eval      # evaluación del chatbot con Gemini real (~30 solicitudes de 500/día)
npm.cmd run eval -- 12 23   # solo algunos casos
```
Si agregas eventos, agrega casos a `data/evaluacion.json` (formato al inicio del archivo).

## Guardar y deshacer cambios (git, desde `chatbot-eventos/`)
```
git status --short    # qué cambió; backend/.env NUNCA debe aparecer
git add -A
git commit -m "qué cambia"
```
- Descartar cambios no guardados de un archivo: `git restore ruta/archivo`
- Deshacer un commit ya hecho (crea uno nuevo que lo revierte): `git revert <código>`
- Recuperar un archivo borrado de un commit viejo: `git checkout <código> -- ruta/archivo` (ej. el validador: `git checkout 63930c7 -- data/validate_events.mjs`)
- Ver historial: `git log --oneline`

## Cambiar la clave o el modelo de Gemini
Editar `backend/.env` (`GEMINI_API_KEY`, `LLM_MODEL`) y reiniciar `npm.cmd run dev`. Límites del modelo: AI Studio → Límite de frecuencia. Si la clave se filtra: borrarla en AI Studio y crear otra.

## Desplegar
Todavía no hay despliegue: la app solo corre en local.

## Si algo falla
| Síntoma | Solución |
|---|---|
| `npm` / `node` no se reconoce | Falta el PATH: ver "Preparar la terminal" |
| "la ejecución de scripts está deshabilitada" | Usar `npm.cmd` |
| "Could not read package.json" | Estás fuera de `backend/`: `cd backend` |
| Timeouts o `querySrv` al conectar a Mongo | Cluster pausado (Atlas → Resume) o cambió tu IP (Atlas → IP Access List) |
| "El LLM respondió con error 503" | Gemini sobrecargado: reintentar en unos segundos |
| "Se agotó el límite gratuito del LLM" | Esperar al día siguiente (se reinicia a medianoche hora del Pacífico) |
| `git log` falla con "less" | `git config --global core.pager cat` |
