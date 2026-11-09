//convierte una fila del CSV en los datos que espera el modelo Event.
export function filaAEvento(fila) {
    const evento = {};
    for (const [columna, valor] of Object.entries(fila)) {
        const limpio = valor.trim();
        if (limpio !== '') evento[columna] = limpio;
    }
    if (evento.pais_elegible) evento.pais_elegible = separar(evento.pais_elegible, ',');
    if (evento.otras_fechas) {
        evento.otras_fechas = separar(evento.otras_fechas, ';').map(par => {
            const [descripcion, fecha] = par.split('=').map(s => s.trim());
            return { descripcion, fecha };
        });
    }
    return evento;
}

function separar(texto, separador) {
    return texto.split(separador).map(s => s.trim()).filter(s => s !== '');
}