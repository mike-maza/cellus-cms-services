export const sheetResponse = {
  success: true,
  message: 'Datos de planilla obtenidos exitosamente',
  data: {
    sheetName: '',
    totalRows: 0,
    // headers: headers,
    // date: fecha,
    // searchDate: searchDate,
    rows: [],
    // processedBy: username,
    processedAt: new Date().toISOString()
  }
}