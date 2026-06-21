/**
 * Lightweight encryption layer for sensitive data in localStorage.
 *
 * Strategy: AES-GCM with a non-extractable CryptoKey stored in IndexedDB.
 * The key material can never be read by JS — only used for encrypt/decrypt.
 * This protects against:
 *   - Browser extensions / 3rd-party scripts reading localStorage directly
 *   - Backup/sync of localStorage containing raw secrets
 *   - Accidental exposure via DevTools "Application" tab
 *
 * Note: a full XSS can still call crypto.subtle.decrypt in-page.
 * This raises the bar significantly but is not a silver bullet.
 */

const DB_NAME = 'restbox-crypto'
const DB_STORE = 'keys'
const DB_KEY = 'aes-key'

let cachedKey: CryptoKey | null = null
let initPromise: Promise<CryptoKey> | null = null

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function loadKey(): Promise<CryptoKey | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly')
    const store = tx.objectStore(DB_STORE)
    const req = store.get(DB_KEY)
    req.onsuccess = () => resolve((req.result as CryptoKey | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function saveKey(key: CryptoKey): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    tx.objectStore(DB_STORE).put(key, DB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getOrCreateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  if (initPromise) return initPromise

  initPromise = (async () => {
    const existing = await loadKey()
    if (existing) {
      cachedKey = existing
      return existing
    }
    const fresh = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false, // non-extractable — cannot be exported
      ['encrypt', 'decrypt'],
    )
    await saveKey(fresh)
    cachedKey = fresh
    return fresh
  })()

  return initPromise
}

function strToBuffer(text: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(text)
  const buf = new ArrayBuffer(encoded.byteLength)
  new Uint8Array(buf).set(encoded)
  return buf
}

function bufferToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf)
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Encrypt a plaintext string. Returns a string in format "enc:v1:<base64-iv+ciphertext>".
 * If the Crypto API is unavailable, returns the plaintext unchanged with "plain:" prefix.
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return `plain:${plaintext}`
  }

  try {
    const key = await getOrCreateKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      strToBuffer(plaintext),
    )
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return `enc:v1:${bytesToBase64(combined)}`
  } catch {
    return `plain:${plaintext}`
  }
}

/**
 * Decrypt a value produced by encrypt().
 * Returns the plaintext, or empty string if decryption fails.
 */
export async function decrypt(value: string): Promise<string> {
  if (!value) return value

  // Legacy unencrypted values (before encryption was added)
  if (!value.startsWith('enc:v1:') && !value.startsWith('plain:')) {
    return value
  }

  if (value.startsWith('plain:')) {
    return value.slice(6)
  }

  try {
    const key = await getOrCreateKey()
    const combined = base64ToBytes(value.slice(7))
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    )
    return bufferToStr(plaintext)
  } catch {
    // Key mismatch or corrupted data — return empty
    return ''
  }
}

/**
 * Check if encryption is available in the current environment.
 */
export function isEncryptionAvailable(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}
