const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre|septiembre', 'octubre', 'noviembre', 'diciembre'];
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const TELEFONO = /\+?\d[\d\s-]{6,}\d/g;

//devuelve los campos con dtos que no aparecen en el texto original(posible invento del LLM)
export function camposNoEncontrados(evento, texto) {
    const t = texto.toLowerCase();
    const sospechosos = [];
    if (evento.url_registro && !t.includes(evento.url_registro.toLowerCase())) sospechosos.push('url_registro');
    if (evento.contacto && !contactoEnTexto(evento.contacto, t)) sospechosos.push('contacto');
    for (const campo of ['fecha_inicio', 'fecha_fin', 'fecha_limite']) {
        if (evento[campo] && !fechaEnTexto(evento[campo], t)) sospechosos.push(campo);
    }
    return sospechosos;
}

//cada correo y telefono del contacto debe estar en ell texto
function contactoEnTexto(contacto, t) {
    const digitosTexto = t.replace(/\D/g, '');
    const correosOK = (contacto.match(EMAIL) ?? []).every(c => t.includes(c.toLowerCase()));
    const telefonosOK = (contacto.match(TELEFONO) ?? []).every(n => digitosTexto.includes(n.replace(/\D/g, '')));
    return correosOK && telefonosOK;
}

//el dia debe aparecer , ya demas el onmbr edel mes o la forma dia/mes.
function fechaEnTexto(fecha, t) {
    const [, mes, dia] = fecha.split('-').map(Number);
    if (!new RegExp(`\\b0?${dia}\\b`).test(t)) return false;
    return new RegExp(`\\b(${MESES[mes - 1]})\\b`).test(t) || new RegExp(`\\b0?${dia}[/-]0?${mes}\\b`).test(t);
}