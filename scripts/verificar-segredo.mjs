// Falha (exit 1) se qualquer valor dos arquivos .env aparecer no build (dist/) ou no que será commitado.
// Uso: node scripts/verificar-segredo.mjs          -> varre dist/
//      node scripts/verificar-segredo.mjs --staged -> varre o que está no stage do git
// Nunca imprime o valor do segredo.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const ENVS = ['.env', 'src/.env', 'public/.env', ...readdirSync('.').filter((f) => /^\.env\./.test(f) && !f.endsWith('.example'))]
const segredos = new Set()
for (const f of ENVS.filter(existsSync)) {
  for (const linha of readFileSync(f, 'utf8').split('\n')) {
    if (!linha.trim() || linha.trim().startsWith('#')) continue
    const valor = linha.includes('=') ? linha.slice(linha.indexOf('=') + 1) : linha
    // aceita qualquer formato: o valor inteiro e cada "palavra" longa dele
    for (const t of [valor.trim().replace(/^['"]|['"]$/g, ''), ...valor.split(/\s+/)]) if (t.length >= 8) segredos.add(t)
  }
}

const achou = (buf) => [...segredos].some((s) => buf.includes(s))
const falha = (msg) => { console.error(`BLOQUEADO: ${msg}`); process.exit(1) }

if (process.argv.includes('--staged')) {
  const nomes = execSync('git diff --cached --name-only', { encoding: 'utf8' }).split('\n').filter(Boolean)
  const env = nomes.find((n) => /(^|\/)\.env/.test(n) && !n.endsWith('.example'))
  if (env) falha(`arquivo de ambiente no commit: ${env}`)
  if (achou(execSync('git diff --cached -U0', { encoding: 'utf8', maxBuffer: 1 << 28 }))) falha('um segredo do .env aparece no conteúdo do commit')
} else {
  const varrer = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n)
      if (statSync(p).isDirectory()) varrer(p)
      else if (/^\.env/.test(n)) falha(`arquivo de ambiente dentro do build: ${p}`)
      else if (achou(readFileSync(p).toString('latin1'))) falha(`segredo do .env encontrado no build: ${p}`)
    }
  }
  if (existsSync('dist')) varrer('dist')
}
console.log(`ok: nenhum segredo encontrado (${segredos.size} valores verificados)`)
