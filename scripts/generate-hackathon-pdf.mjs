import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import path from 'path'
import { existsSync } from 'fs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const htmlPath = path.join(root, 'docs', 'hackathon-submission.html')
const pdfPath = path.join(root, 'docs', 'Lecturify-Hackathon-Submission.pdf')

if (!existsSync(htmlPath)) {
  console.error('Missing:', htmlPath)
  process.exit(1)
}

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' })
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
})
await browser.close()
console.log('PDF created:', pdfPath)
