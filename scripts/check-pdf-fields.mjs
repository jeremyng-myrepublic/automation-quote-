import { PDFDocument } from 'pdf-lib'
import fs from 'fs'

const pdfBytes = fs.readFileSync('public/SAF.pdf')
const pdfDoc = await PDFDocument.load(pdfBytes)
const form = pdfDoc.getForm()
const fields = form.getFields()

if (fields.length === 0) {
  console.log('NO FORM FIELDS FOUND - PDF needs coordinate-based filling')
} else {
  console.log('FORM FIELDS FOUND:')
  fields.forEach(f => console.log(f.getName(), '-', f.constructor.name))
}
