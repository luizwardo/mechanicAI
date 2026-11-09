const PREFIX = 'sha256:'

export function isPasswordHash(value: string): boolean {
  return value.startsWith(PREFIX) && value.length === PREFIX.length + 64
}

export async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.trim().toLowerCase()}|${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${PREFIX}${hex}`
}

export async function passwordMatches(stored: string, email: string, password: string): Promise<boolean> {
  if (isPasswordHash(stored)) {
    return stored === (await hashPassword(email, password))
  }
  return stored.length > 0 && stored === password
}
