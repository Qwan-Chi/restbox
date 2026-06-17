import type { Anomaly, ResponseData } from '@/types'

const ERROR_KEYS = new Set(['error', 'err', 'errors', 'message', 'detail', 'details'])
const SECRET_KEYS = new Set([
  'token',
  'password',
  'secret',
  'key',
  'apikey',
  'api_key',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'privatekey',
  'private_key',
  'authorization',
])

function isIdField(key: string): boolean {
  const lower = key.toLowerCase()
  return lower === 'id' || lower.endsWith('_id') || lower.endsWith('id') || lower.endsWith('Id')
}

function isSecretKey(key: string): boolean {
  return SECRET_KEYS.has(key.toLowerCase())
}

function walk(value: unknown, path: string, anomalies: Anomaly[], visited: Set<unknown>): void {
  if (value === null || value === undefined) return
  if (typeof value !== 'object') return
  if (visited.has(value)) return
  visited.add(value)

  if (Array.isArray(value)) {
    if (value.length === 0) {
      anomalies.push({
        type: 'info',
        message: `Пустой массив по пути \`${path || 'root'}\` — возможно, данных нет.`,
        field: path || 'root',
      })
    } else {
      value.forEach((item, i) => walk(item, `${path}[${i}]`, anomalies, visited))
    }
    return
  }

  const record = value as Record<string, unknown>
  for (const [k, v] of Object.entries(record)) {
    const childPath = path ? `${path}.${k}` : k

    if (isIdField(k) && v === null) {
      anomalies.push({
        type: 'warning',
        message: `Поле \`${childPath}\` (вероятно идентификатор) равно null.`,
        field: childPath,
      })
    }

    if (isSecretKey(k) && v !== null && v !== undefined && v !== '') {
      anomalies.push({
        type: 'warning',
        message: `Поле \`${childPath}\` похоже на чувствительные данные — проверь, не утекает ли секрет.`,
        field: childPath,
      })
    }

    if (k.toLowerCase() === 'success' && v === false) {
      anomalies.push({
        type: 'error',
        message: `Поле \`${childPath}\` равно false — API сообщает об ошибке в теле.`,
        field: childPath,
      })
    }

    if (ERROR_KEYS.has(k.toLowerCase()) && typeof v === 'string' && v.trim().length > 0) {
      anomalies.push({
        type: 'warning',
        message: `В ответе есть поле \`${childPath}\` с описанием ошибки: "${v.slice(0, 80)}".`,
        field: childPath,
      })
    }

    walk(v, childPath, anomalies, visited)
  }
}

export function detectAnomalies(response: ResponseData): Anomaly[] {
  const anomalies: Anomaly[] = []
  const { status, duration, body } = response

  // 10. Статус 0 — CORS или сеть
  if (status === 0) {
    anomalies.push({
      type: 'error',
      message: 'Сетевая ошибка или CORS. Браузер заблокировал запрос или сервер недоступен.',
    })
    return anomalies
  }

  // 8. Статус 401 — подсказка про авторизацию
  if (status === 401) {
    anomalies.push({
      type: 'error',
      message: '401 Unauthorized — отсутствует или неверный токен авторизации. Проверь вкладку Auth.',
    })
  }

  // 9. Статус 429 — rate limit
  if (status === 429) {
    anomalies.push({
      type: 'warning',
      message: '429 Too Many Requests — превышен лимит запросов. Добавь задержку или проверь заголовок Retry-After.',
    })
  }

  // 6. Время ответа > 3000ms
  if (duration > 3000) {
    anomalies.push({
      type: 'warning',
      message: `Время ответа ${Math.round(duration)}ms — медленно. Стоит проверить производительность API.`,
    })
  }

  const is2xx = status >= 200 && status < 300

  // 2. Статус 200 но тело пустое или null
  if (is2xx && (body === null || body === undefined || body === '')) {
    anomalies.push({
      type: 'info',
      message: 'Успешный статус, но тело ответа пустое.',
    })
  }

  // 1. Статус 2xx но в теле есть поле ошибки
  // 3. Поля *id равны null
  // 4. Пустые массивы
  // 5. success: false при 200
  // 7. Секретные поля
  if (is2xx && body !== null && body !== undefined && typeof body === 'object') {
    walk(body, '', anomalies, new Set<unknown>())
  }

  return anomalies
}
