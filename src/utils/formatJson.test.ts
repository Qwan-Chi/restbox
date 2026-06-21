import { describe, it, expect } from 'vitest'
import {
  formatJson,
  minifyJson,
  tryParseJson,
  isValidJson,
  formatBytes,
  formatDuration,
  byteLength,
} from './formatJson'

describe('formatJson', () => {
  it('pretty-prints an object', () => {
    const result = formatJson({ a: 1, b: 2 })
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}')
  })

  it('returns string fallback for circular references', () => {
    const obj: Record<string, unknown> = {}
    obj.self = obj
    const result = formatJson(obj)
    expect(typeof result).toBe('string')
  })
})

describe('minifyJson', () => {
  it('compacts JSON', () => {
    expect(minifyJson({ a: 1 })).toBe('{"a":1}')
  })
})

describe('tryParseJson', () => {
  it('parses valid JSON', () => {
    const result = tryParseJson('{"x":42}')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual({ x: 42 })
  })

  it('returns error for invalid JSON', () => {
    const result = tryParseJson('{bad}')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBeTruthy()
  })
})

describe('isValidJson', () => {
  it('accepts valid JSON', () => {
    expect(isValidJson('{"a":1}')).toBe(true)
    expect(isValidJson('[1,2,3]')).toBe(true)
    expect(isValidJson('"hello"')).toBe(true)
    expect(isValidJson('null')).toBe(true)
  })

  it('rejects invalid JSON', () => {
    expect(isValidJson('')).toBe(false)
    expect(isValidJson('{bad}')).toBe(false)
    expect(isValidJson('undefined')).toBe(false)
  })
})

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(1048576)).toBe('1.00 MB')
    expect(formatBytes(5242880)).toBe('5.00 MB')
  })
})

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(0)).toBe('0ms')
    expect(formatDuration(42)).toBe('42ms')
    expect(formatDuration(999)).toBe('999ms')
  })

  it('formats seconds', () => {
    expect(formatDuration(1000)).toBe('1.00s')
    expect(formatDuration(2500)).toBe('2.50s')
  })
})

describe('byteLength', () => {
  it('counts ASCII bytes', () => {
    expect(byteLength('')).toBe(0)
    expect(byteLength('abc')).toBe(3)
  })

  it('counts multi-byte characters', () => {
    expect(byteLength('привет')).toBe(12) // 6 chars × 2 bytes
    expect(byteLength('🔒')).toBe(4)      // emoji = 4 bytes
  })
})
