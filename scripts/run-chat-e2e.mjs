import { spawn } from 'node:child_process'

const supabaseBin = './node_modules/.bin/supabase'
const playwrightBin = './node_modules/.bin/playwright'
const stackName = 'e2e-chat'

function run(command, args, { capture = false, env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    })
    let stdout = ''
    let stderr = ''
    if (capture) {
      child.stdout.on('data', (chunk) => { stdout += chunk })
      child.stderr.on('data', (chunk) => { stderr += chunk })
    }
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(`${command} terminó con código ${code}.${stderr ? `\n${stderr}` : ''}`))
    })
  })
}

async function stopStack() {
  await run(supabaseBin, ['stop', '--stack', stackName])
}

let stackStarted = false
try {
  console.log('Encendiendo Supabase local para la prueba del chat…')
  await run(supabaseBin, [
    'start', '--stack', stackName, '--runtime', 'native',
    '--exclude', 'studio,mail,functions,analytics,pooler', '--eager',
  ])
  stackStarted = true

  const { stdout } = await run(
    supabaseBin,
    ['status', '--stack', stackName, '--output-format', 'json'],
    { capture: true },
  )
  const status = JSON.parse(stdout)
  const apiUrl = status.env?.API_URL
  const publishableKey = status.env?.PUBLISHABLE_KEY || status.env?.ANON_KEY
  const serviceRoleKey = status.env?.SERVICE_ROLE_KEY || status.env?.SECRET_KEY
  if (!apiUrl || !publishableKey || !serviceRoleKey) {
    throw new Error('Supabase local no ha devuelto las claves necesarias para la prueba.')
  }

  console.log('Ejecutando el recorrido real del chat en Chrome…')
  await run(playwrightBin, ['test', 'e2e/chat-flow.spec.js'], {
    env: {
      ...process.env,
      VITE_SUPABASE_URL: apiUrl,
      VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      E2E_SUPABASE_URL: apiUrl,
      E2E_SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    },
  })
} finally {
  if (stackStarted) {
    console.log('Apagando Supabase local…')
    await stopStack()
  }
}
