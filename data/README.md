# Datos de eventos

`events_seed.csv` es la base semilla: solo eventos reales. Los datos de prueba van en un archivo aparte que nunca se carga a la base real.

| columna | obligatoria | valores |
|---|---|---|
| nombre | sí | texto |
| type | sí | congreso, beca, curso_extracurricular, otro |
| ambito | sí | universidad (organiza tu universidad/facultad), nacional (en Perú, abierto a público), internacional (fuera de Perú o alcance internacional), externo (oferta privada o comercial) |
| dirigido_a | no | a quién va dirigido (público), separado de requisitos |
| pais_elegible | no (aviso si es beca) | país(es) que pueden participar, ej. Perú, Chile. Vacío = no indicado en la fuente |
| fecha_inicio, fecha_fin | sí, salvo convocatorias sin fechas del evento | YYYY-MM-DD (fin >= inicio). Si faltan, debe haber fecha_limite |
| hora | no | HH:MM en 24 h (hora de Perú) |
| lugar | no (sí si no es virtual) | texto o plataforma (ej. Google Meet) |
| modalidad | no | presencial, virtual, hibrido |
| requisitos | no | texto (entre comillas si tiene comas) |
| costo | no | texto libre (ej. S/ 660 por equipo) |
| fecha_limite | no | YYYY-MM-DD, cierre de inscripción (<= fecha_fin) |
| otras_fechas | no | `descripción=YYYY-MM-DD; descripción=YYYY-MM-DD` (ej. envío de artículos, resultados) |
| contacto | no | correo o teléfono institucional publicado en la fuente |
| notas | no | descripción, temas, enlaces extra |
| url_registro | no (aviso) | http(s). Vacío si la inscripción es por otra vía (ej. formulario enviado por comentario) |
| fuente_url | sí si origen=real | enlace a la publicación original |
| fecha_captura | sí | YYYY-MM-DD, cuándo copiaste el dato |
| origen | sí | real, sintetico |

Las columnas coinciden con el modelo `Event` (`backend/src/models/event.model.js`); el orden de las columnas no importa.

## Cargar a la base
Con el backend corriendo (`npm run dev` en `backend/`), abrir `http://localhost:3000/admin.html` como admin, subir el CSV, revisar la vista previa y confirmar. La vista previa valida con las reglas del modelo. La carga crea y actualiza; no borra eventos que falten en el CSV.

Vigente = `fecha_fin` (o `fecha_limite` si no hay fechas del evento) >= hoy.
