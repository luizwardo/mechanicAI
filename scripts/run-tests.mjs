import { spawnSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'

rmSync(new URL('../dist-test', import.meta.url), { recursive: true, force: true })

const tsc = spawnSync(
  process.execPath,
  ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.test.json'],
  { stdio: 'inherit' },
)
if (tsc.status !== 0) process.exit(tsc.status ?? 1)
writeFileSync(new URL('../dist-test/package.json', import.meta.url), '{"type":"commonjs"}\n')

const test = spawnSync(process.execPath, ['--test', 'scripts/rules.test.mjs'], { stdio: 'inherit' })
process.exit(test.status ?? 1)
