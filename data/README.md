# Datos de eventos

`events_seed.csv` es la base semilla. Las 3 filas de muestra son **sintéticas** (`origen=sintetico`, URLs de example.com): bórralas al cargar datos reales.

| columna | obligatoria | valores |
|---|---|---|
| nombre | sí | texto |
| type | sí | congreso, beca, curso_extracurricular, otro |
| ambito | sí | universidad (organiza tu universidad/facultad), nacional (en Perú, abierto a público), internacional (fuera de Perú o alcance internacional), externo (oferta privada o comercial) |
| pais_elegible | no (aviso si es beca) | país(es) que pueden participar, ej. Perú, Chile. Vacío = no indicado en la fuente |
| fecha_inicio, fecha_fin | sí, salvo convocatorias sin fechas del evento | YYYY-MM-DD (fin >= inicio). Si faltan, debe haber fecha_limite |
| hora | no | HH:MM en 24 h (hora de Perú) |
| lugar | no (sí si no es virtual) | texto o plataforma (ej. Google Meet) |
| modalidad | no | presencial, virtual, hibrido |
| requisitos | no | texto (entre comillas si tiene comas) |
| costo | no | texto libre (ej. S/ 660 por equipo) |
| fecha_limite | no | YYYY-MM-DD, cierre de inscripción (<= fecha_fin) |
| contacto | no | correo o teléfono institucional publicado en la fuente |
| notas | no | descripción, temas, enlaces extra |
| url_registro | no (aviso) | http(s). Vacío si la inscripción es por otra vía (ej. formulario enviado por comentario) |
| fuente_url | sí si origen=real | enlace a la publicación original |
| fecha_captura | sí | YYYY-MM-DD, cuándo copiaste el dato |
| origen | sí | real, sintetico |

Los campos `nombre`, `type`, `fecha_inicio`, `fecha_fin`, `url_registro` coinciden con el modelo `Event` del proyecto.

## Validar
```
node validate_events.mjs                              # events_seed.csv
node validate_events.mjs otro.csv --hoy 2025-03-15    # cuenta vigentes/vencidos a esa fecha
```
Vigente = `fecha_fin` (o `fecha_limite` si no hay fechas del evento) >= hoy.

Sale con código 1 si hay errores. Sin dependencias (Node 18+).
