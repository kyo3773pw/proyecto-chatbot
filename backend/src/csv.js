//lee un CSV(RFC 41800: comillas, comas y saltos de linea dentro de comillas) y devuelve filas de celdas.

export function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    text = text.replace(/^\uFEFF/, ''); // BOM
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } // doble comilla
            else if (c === '"') quoted = false;  // fin de comilla
            else field += c;  // dentro de comilla
        } else if (c === '"') quoted = true;  // inicio de comilla
        else if (c === ',') { row.push(field); field = ''; }  // fin de campo
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++; // salto de linea CRLF
            row.push(field); field = '';
            if (row.some(v => v.trim() !== '')) rows.push(row); // no agregar fila vacia
            row = [];
        } else field += c;  // dentro de campo
    }
    row.push(field); // ultimo campo
    if (row.some(v => v.trim() !== '')) rows.push(row); // no agregar fila vacia
    return rows;
}

//usar la primera fla como encabezado y devolver un array de objetos {columna: valor}
export function csvAObjetos(text) {
    const [encabezado, ...filas] = parseCsv(text);
    return filas.map(celdas =>
        Object.fromEntries(encabezado.map((columna, i) => [columna.trim(), celdas[i] ?? ''])));
}

