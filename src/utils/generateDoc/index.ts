import { writeFile, utils } from 'xlsx'
// import { informationBadPayments } from '@/utils/email'

export const generateDocOfBadPayments = async (
  columns: any,
  rows: any,
  sheetName: string
) => {
  const workbook = utils.book_new()
  const worksheet = utils.json_to_sheet(rows)
  const fileName = `${sheetName.replace(/\s/g, '-')}.xlsx`

  utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31))

  utils.sheet_add_aoa(worksheet, [columns], { origin: 'A1' })

  writeFile(workbook, fileName)

//   await informationBadPayments(sheetName, fileName)
}

export const generateDocOfBadTicketOrnato = async (rows: any) => {
  const workbook = utils.book_new()
  const worksheet = utils.json_to_sheet(rows)

  utils.book_append_sheet(workbook, worksheet, 'Boletas de ornato malas')

  utils.sheet_add_aoa(worksheet, [['Nombre Completo']], { origin: 'A1' })

  writeFile(workbook, 'Boletas de ornato malas.xlsx')

//   await informationBadPayments(
//     'Boletas de ornato malas',
//     'Boletas de ornato malas.xlsx',
//     true
//   )
}
