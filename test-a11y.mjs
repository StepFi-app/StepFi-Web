import puppeteer from 'puppeteer'
import { createServer } from 'vite'
import { resolve } from 'path'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

const ROUTES = [
  '/',
  '/dashboard',
  '/contracts',
  '/vendors',
  '/vendors/register',
  '/sponsors',
  '/sponsors/onboarding',
  '/vouch',
  '/not-found',
]

async function main() {
  const server = await createServer({
    root: resolve('.'),
    server: { port: PORT, strictPort: true },
    logLevel: 'silent',
  })
  await server.listen()

  console.log(`Preview server running on ${BASE_URL}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()
  let totalViolations = 0
  let allViolations = []

  // Inject axe-core
  await page.setBypassCSP(true)

  for (const route of ROUTES) {
    console.log(`\nScanning ${route}...`)
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })

    // Inject axe-core script
    await page.addScriptTag({
      path: resolve('node_modules/axe-core/axe.min.js'),
    })

    const results = await page.evaluate(() => {
      return axe.run(document)
    })

    if (results.violations.length > 0) {
      totalViolations += results.violations.length
      console.log(`  Found ${results.violations.length} violation(s):`)
      for (const v of results.violations) {
        console.log(`  - [${v.impact}] ${v.help} (${v.id})`)
        for (const n of v.nodes) {
          console.log(`    Element: ${n.target.join(', ')}`)
        }
        allViolations.push({ route, violation: v })
      }
    } else {
      console.log('  ✓ No violations')
    }
  }

  await browser.close()
  try { await server.close() } catch {}

  if (totalViolations > 0) {
    console.log(`\n========================================`)
    console.log(`FAILED: ${totalViolations} accessibility violation(s) found.`)
    console.log(`========================================\n`)
    process.exit(1)
  }

  console.log(`\n========================================`)
  console.log(`PASSED: 0 accessibility violations found.`)
  console.log(`========================================\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
