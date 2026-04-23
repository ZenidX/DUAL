/**
 * Script de Google Apps Script para crear reuniones en Calendar
 * desde una tabla en Google Sheets.
 *
 * ESTRUCTURA ESPERADA DE LA TABLA (fila 1 = encabezados):
 * | A: Título | B: Fecha | C: Hora Inicio | D: Hora Fin | E: Descripción | F: Asistentes | G: Estado |
 *
 * - Fecha: formato DD/MM/YYYY o YYYY-MM-DD
 * - Hora Inicio/Fin: formato HH:MM (24h)
 * - Asistentes: emails separados por coma (ej: juan@empresa.com, maria@empresa.com)
 * - Estado: se rellena automáticamente con "Creada" cuando se genera la reunión
 */

// ===================== CONFIGURACIÓN =====================
const CONFIG = {
  NOMBRE_HOJA: 'Reuniones',        // Nombre de la hoja con los datos
  FILA_INICIO: 2,                   // Primera fila de datos (2 si fila 1 son encabezados)
  COLUMNAS: {
    TITULO: 1,        // A
    FECHA: 2,         // B
    HORA_INICIO: 3,   // C
    HORA_FIN: 4,      // D
    DESCRIPCION: 5,   // E
    ASISTENTES: 6,    // F
    ESTADO: 7         // G
  },
  CALENDAR_ID: 'primary',           // 'primary' para calendario principal, o ID específico
  ZONA_HORARIA: 'Europe/Madrid',    // Ajusta a tu zona horaria
  ENVIAR_INVITACIONES: true         // true para enviar emails a los invitados
};

/**
 * Función principal - Ejecutar para crear las reuniones
 */
function crearReunionesDesdeSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);

  if (!sheet) {
    SpreadsheetApp.getUi().alert(`No se encontró la hoja "${CONFIG.NOMBRE_HOJA}"`);
    return;
  }

  const datos = sheet.getDataRange().getValues();
  const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID) || CalendarApp.getDefaultCalendar();

  let reunionesCreadas = 0;
  let errores = [];

  // Iterar desde la fila de inicio (saltando encabezados)
  for (let i = CONFIG.FILA_INICIO - 1; i < datos.length; i++) {
    const fila = datos[i];
    const numFila = i + 1;

    // Obtener valores de la fila
    const titulo = fila[CONFIG.COLUMNAS.TITULO - 1];
    const fecha = fila[CONFIG.COLUMNAS.FECHA - 1];
    const horaInicio = fila[CONFIG.COLUMNAS.HORA_INICIO - 1];
    const horaFin = fila[CONFIG.COLUMNAS.HORA_FIN - 1];
    const descripcion = fila[CONFIG.COLUMNAS.DESCRIPCION - 1] || '';
    const asistentesRaw = fila[CONFIG.COLUMNAS.ASISTENTES - 1] || '';
    const estado = fila[CONFIG.COLUMNAS.ESTADO - 1];

    // Saltar filas vacías o ya procesadas
    if (!titulo || !fecha || estado === 'Creada') {
      continue;
    }

    try {
      // Parsear fecha y horas
      const fechaInicio = parsearFechaHora(fecha, horaInicio);
      const fechaFin = parsearFechaHora(fecha, horaFin);

      if (!fechaInicio || !fechaFin) {
        throw new Error('Formato de fecha/hora inválido');
      }

      // Parsear lista de asistentes
      const asistentes = parsearAsistentes(asistentesRaw);

      // Crear el evento
      const evento = calendar.createEvent(titulo, fechaInicio, fechaFin, {
        description: descripcion,
        guests: asistentes.join(','),
        sendInvites: CONFIG.ENVIAR_INVITACIONES
      });

      // Marcar como creada y guardar ID del evento
      sheet.getRange(numFila, CONFIG.COLUMNAS.ESTADO).setValue('Creada');
      sheet.getRange(numFila, CONFIG.COLUMNAS.ESTADO + 1).setValue(evento.getId()); // Columna H para ID

      reunionesCreadas++;
      Logger.log(`✓ Reunión creada: "${titulo}" - ${fechaInicio}`);

    } catch (error) {
      errores.push(`Fila ${numFila}: ${error.message}`);
      sheet.getRange(numFila, CONFIG.COLUMNAS.ESTADO).setValue('Error: ' + error.message);
      Logger.log(`✗ Error en fila ${numFila}: ${error.message}`);
    }
  }

  // Mostrar resumen
  const mensaje = `Proceso completado:\n- Reuniones creadas: ${reunionesCreadas}\n- Errores: ${errores.length}`;
  Logger.log(mensaje);
  SpreadsheetApp.getUi().alert(mensaje);

  if (errores.length > 0) {
    Logger.log('Detalle de errores:\n' + errores.join('\n'));
  }
}

/**
 * Parsea una fecha y hora combinándolas en un objeto Date
 */
function parsearFechaHora(fecha, hora) {
  let fechaObj;

  // Si fecha ya es un objeto Date (Sheets a veces lo convierte)
  if (fecha instanceof Date) {
    fechaObj = new Date(fecha);
  } else {
    // Intentar parsear string de fecha
    const fechaStr = String(fecha).trim();

    // Formato DD/MM/YYYY
    if (fechaStr.includes('/')) {
      const partes = fechaStr.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const anio = parseInt(partes[2], 10);
        fechaObj = new Date(anio, mes, dia);
      }
    }
    // Formato YYYY-MM-DD
    else if (fechaStr.includes('-')) {
      fechaObj = new Date(fechaStr);
    }
  }

  if (!fechaObj || isNaN(fechaObj.getTime())) {
    return null;
  }

  // Parsear hora
  let horas = 0, minutos = 0;

  if (hora instanceof Date) {
    horas = hora.getHours();
    minutos = hora.getMinutes();
  } else if (hora) {
    const horaStr = String(hora).trim();
    const partesHora = horaStr.split(':');
    if (partesHora.length >= 2) {
      horas = parseInt(partesHora[0], 10);
      minutos = parseInt(partesHora[1], 10);
    }
  }

  fechaObj.setHours(horas, minutos, 0, 0);
  return fechaObj;
}

/**
 * Parsea la cadena de asistentes y devuelve array de emails válidos
 */
function parsearAsistentes(asistentesRaw) {
  if (!asistentesRaw) return [];

  return String(asistentesRaw)
    .split(/[,;]/)
    .map(email => email.trim().toLowerCase())
    .filter(email => email && email.includes('@'));
}

/**
 * Crea el menú personalizado en Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📅 Reuniones')
    .addItem('Crear reuniones desde tabla', 'crearReunionesDesdeSheet')
    .addItem('Crear hoja de ejemplo', 'crearHojaEjemplo')
    .addToUi();
}

/**
 * Crea una hoja con la estructura de ejemplo
 */
function crearHojaEjemplo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Verificar si ya existe
  let sheet = ss.getSheetByName(CONFIG.NOMBRE_HOJA);
  if (sheet) {
    const ui = SpreadsheetApp.getUi();
    const respuesta = ui.alert(
      'La hoja ya existe',
      `¿Deseas sobrescribir la hoja "${CONFIG.NOMBRE_HOJA}"?`,
      ui.ButtonSet.YES_NO
    );
    if (respuesta !== ui.Button.YES) return;
    ss.deleteSheet(sheet);
  }

  // Crear nueva hoja
  sheet = ss.insertSheet(CONFIG.NOMBRE_HOJA);

  // Encabezados
  const encabezados = ['Título', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Descripción', 'Asistentes', 'Estado', 'ID Evento'];
  sheet.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
  sheet.getRange(1, 1, 1, encabezados.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');

  // Datos de ejemplo
  const ejemplos = [
    ['Reunión de proyecto', '15/04/2026', '10:00', '11:00', 'Revisión semanal del proyecto X', 'juan@empresa.com, maria@empresa.com', '', ''],
    ['Sincronización equipo', '16/04/2026', '09:30', '10:00', 'Daily standup', 'pedro@empresa.com, ana@empresa.com, luis@empresa.com', '', ''],
    ['Demo cliente', '17/04/2026', '15:00', '16:30', 'Presentación de avances al cliente', 'cliente@external.com, pm@empresa.com', '', '']
  ];
  sheet.getRange(2, 1, ejemplos.length, ejemplos[0].length).setValues(ejemplos);

  // Ajustar anchos de columna
  sheet.setColumnWidth(1, 200);  // Título
  sheet.setColumnWidth(2, 100);  // Fecha
  sheet.setColumnWidth(3, 100);  // Hora Inicio
  sheet.setColumnWidth(4, 100);  // Hora Fin
  sheet.setColumnWidth(5, 250);  // Descripción
  sheet.setColumnWidth(6, 300);  // Asistentes
  sheet.setColumnWidth(7, 100);  // Estado
  sheet.setColumnWidth(8, 200);  // ID Evento

  // Formato condicional para estado
  const reglaCreada = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Creada')
    .setBackground('#c6efce')
    .setRanges([sheet.getRange('G:G')])
    .build();

  const reglaError = SpreadsheetApp.newConditionalFormatRule()
    .whenTextStartsWith('Error')
    .setBackground('#ffc7ce')
    .setRanges([sheet.getRange('G:G')])
    .build();

  sheet.setConditionalFormatRules([reglaCreada, reglaError]);

  SpreadsheetApp.getUi().alert('Hoja de ejemplo creada correctamente.\n\nRellena los datos y usa el menú "📅 Reuniones > Crear reuniones desde tabla"');
}

/**
 * Función para eliminar reuniones creadas (útil para pruebas)
 * ⚠️ Usar con cuidado
 */
function eliminarReunionesCreadas() {
  const ui = SpreadsheetApp.getUi();
  const respuesta = ui.alert(
    '⚠️ Advertencia',
    '¿Estás seguro de que quieres eliminar todas las reuniones creadas desde esta hoja?',
    ui.ButtonSet.YES_NO
  );

  if (respuesta !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!sheet) return;

  const datos = sheet.getDataRange().getValues();
  const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID) || CalendarApp.getDefaultCalendar();

  let eliminadas = 0;

  for (let i = CONFIG.FILA_INICIO - 1; i < datos.length; i++) {
    const eventoId = datos[i][CONFIG.COLUMNAS.ESTADO]; // Columna H tiene el ID
    const numFila = i + 1;

    if (eventoId && typeof eventoId === 'string' && eventoId.includes('@')) {
      try {
        const evento = calendar.getEventById(eventoId);
        if (evento) {
          evento.deleteEvent();
          eliminadas++;
        }
        sheet.getRange(numFila, CONFIG.COLUMNAS.ESTADO).setValue('');
        sheet.getRange(numFila, CONFIG.COLUMNAS.ESTADO + 1).setValue('');
      } catch (e) {
        Logger.log(`Error eliminando evento en fila ${numFila}: ${e.message}`);
      }
    }
  }

  ui.alert(`Se eliminaron ${eliminadas} reuniones.`);
}
