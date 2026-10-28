import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { expect, test } from '@playwright/test'

const supabaseUrl = process.env.E2E_SUPABASE_URL
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY
const canRunChat = Boolean(supabaseUrl && serviceRoleKey)
const imagePath = fileURLToPath(new URL('../src/assets/hero.png', import.meta.url))

test.describe('chat autenticado con Supabase local', () => {
  test.skip(!canRunChat, 'Necesita el Supabase local que prepara npm run test:e2e:chat.')

  let admin
  let userId
  let email
  const password = 'Lumera-E2E-2026!'

  test.beforeEach(async ({ browserName: _browserName }, testInfo) => {
    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const suffix = `${testInfo.project.name}-${randomUUID()}`.toLowerCase()
    email = `playwright-${suffix}@lumera.local`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Cliente Playwright',
        username: `pw_${randomUUID().replaceAll('-', '').slice(0, 20)}`,
      },
    })
    if (error) throw error
    userId = data.user.id
  })

  test.afterEach(async () => {
    if (!admin || !userId) return
    const { data: conversations } = await admin
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
    const conversationIds = (conversations || []).map(({ id }) => id)
    if (conversationIds.length) {
      const { data: messages } = await admin
        .from('messages')
        .select('id')
        .in('conversation_id', conversationIds)
      const messageIds = (messages || []).map(({ id }) => id)
      if (messageIds.length) {
        const { data: attachments } = await admin
          .from('message_attachments')
          .select('storage_path')
          .in('message_id', messageIds)
        const paths = (attachments || []).map(({ storage_path: path }) => path)
        if (paths.length) await admin.storage.from('chat-media').remove(paths)
      }
    }
    await admin.auth.admin.deleteUser(userId)
  })

  test('inicia sesión, envía texto y adjunta una imagen privada', async ({ page }) => {
    await page.goto('/entrar')
    await page.getByLabel('Correo o nickname').fill(email)
    await page.getByLabel('Contraseña').fill(password)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/mi-cuenta$/)

    await page.goto('/inmuebles/1')
    await page.getByRole('link', { name: 'Contactar sobre esta propiedad' }).click()
    await expect(page).toHaveURL(/\/mensajes\/1$/)
    await expect(page.getByRole('textbox', { name: 'Mensaje' })).toBeVisible()

    const textMessage = `Mensaje E2E ${randomUUID()}`
    await page.getByRole('textbox', { name: 'Mensaje' }).fill(textMessage)
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(page.getByText(textMessage, { exact: true })).toBeVisible()

    await expect.poll(async () => {
      const { count } = await admin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .eq('content', textMessage)
      return count
    }).toBe(1)

    await page.locator('input[type="file"]').setInputFiles(imagePath)
    await expect(page.getByText('hero.png', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(page.getByRole('img', { name: 'hero.png' })).toBeVisible()

    await expect.poll(async () => {
      const { count } = await admin
        .from('message_attachments')
        .select('*', { count: 'exact', head: true })
        .eq('uploader_id', userId)
        .eq('original_name', 'hero.png')
      return count
    }).toBe(1)
  })
})
