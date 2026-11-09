# Carga de eventos desde CSV
Estado: acordado (2026-11-09)

**Problema:** el admin necesita cargar muchos eventos a la vez desde el navegador, sin terminal y sin duplicar.

**Ejemplos:**
1. CSV con 10 filas nuevas válidas → vista previa "10 se crearían" → Confirmar → 10 creados.
2. CSV con 9 válidas y la fila 5 es una beca sin fecha_limite → previa marca "fila 5: fecha_limite obligatoria"; al confirmar se cargan las 9.
3. Fila con nombre + fecha_inicio existente: si cambió el costo → "actualizado: costo"; si todo es igual → "sin cambios" y no se toca.

**Reglas:** solo admins. Nada se guarda sin Confirmar. La página muestra las columnas aceptadas y su formato. `otras_fechas` en una celda: `descripción=AAAA-MM-DD; descripción=AAAA-MM-DD`.

**Fuera de alcance:** formulario de un solo evento (spec aparte; ya existe POST /api/admin/events), sugerencias de eventos por usuarios (spec futuro), editar filas en la página, Excel (.xlsx), borrar eventos ausentes del CSV, front en React. Límite de tamaño: el body de 100 KB actual (~150 eventos).

**Listo cuando:**
- Test: un CSV mixto (nuevo, inválido, existente cambiado, existente igual) da el informe correcto; sin confirmar la base no cambia, con confirmar queda como se espera.
- Un usuario no admin recibe 403.
- Subo el events_seed.csv real desde el navegador, veo la previa y confirmo.
