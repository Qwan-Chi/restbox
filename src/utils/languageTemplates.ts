import type { CodeLanguage, RequestConfig } from '@/types'

export const CODE_LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'curl', label: 'cURL' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
]

export function generateCodeSnippet(config: RequestConfig, language: CodeLanguage): string {
  const url = config.url || 'https://api.example.com/endpoint'
  const method = config.method
  const enabledHeaders = config.headers.filter((h) => h.enabled && h.key.trim())
  const enabledParams = config.params.filter((p) => p.enabled && p.key.trim())

  const queryString = enabledParams.length
    ? '?' + enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
    : ''
  const fullUrl = url + queryString

  const headerObj: Record<string, string> = {}
  for (const h of enabledHeaders) headerObj[h.key] = h.value

  let bodyStr = ''
  if (config.body.type === 'json' && config.body.content.trim()) {
    bodyStr = config.body.content
  } else if (config.body.type === 'raw' && config.body.content.trim()) {
    bodyStr = config.body.content
  } else if (config.body.type === 'form-data') {
    const fd = config.body.formData.filter((f) => f.enabled && f.key.trim())
    if (fd.length) bodyStr = JSON.stringify(Object.fromEntries(fd.map((f) => [f.key, f.value])))
  }

  switch (language) {
    case 'curl': {
      const parts = [`curl -X ${method} '${fullUrl}'`]
      for (const [k, v] of Object.entries(headerObj)) parts.push(`  -H '${k}: ${v}'`)
      if (bodyStr) parts.push(`  -H 'Content-Type: application/json'`, `  -d '${bodyStr}'`)
      return parts.join(' \\\n')
    }

    case 'javascript': {
      const opts: string[] = [`  method: '${method}'`]
      const hdrs = { ...headerObj }
      if (bodyStr) {
        hdrs['Content-Type'] = hdrs['Content-Type'] || 'application/json'
        opts.push(`  headers: ${JSON.stringify(hdrs, null, 2).replace(/\n/g, '\n  ')}`)
        opts.push(`  body: JSON.stringify(${bodyStr})`)
      } else if (Object.keys(hdrs).length) {
        opts.push(`  headers: ${JSON.stringify(hdrs, null, 2).replace(/\n/g, '\n  ')}`)
      }
      return `const res = await fetch('${fullUrl}', {\n${opts.join(',\n')}\n});\nconst data = await res.json();\nconsole.log(data);`
    }

    case 'typescript': {
      const opts: string[] = [`  method: '${method}'`]
      const hdrs = { ...headerObj }
      if (bodyStr) {
        hdrs['Content-Type'] = hdrs['Content-Type'] || 'application/json'
        opts.push(`  headers: ${JSON.stringify(hdrs, null, 2).replace(/\n/g, '\n  ')}`)
        opts.push(`  body: JSON.stringify(${bodyStr})`)
      } else if (Object.keys(hdrs).length) {
        opts.push(`  headers: ${JSON.stringify(hdrs, null, 2).replace(/\n/g, '\n  ')}`)
      }
      return `interface Response {\n  // опиши поля ответа\n}\n\nconst res = await fetch('${fullUrl}', {\n${opts.join(',\n')}\n});\nconst data: Response = await res.json();\nconsole.log(data);`
    }

    case 'python': {
      const lines: string[] = ['import requests', '', 'url = ' + repr(fullUrl)]
      if (Object.keys(headerObj).length || bodyStr) {
        const hdrs = { ...headerObj }
        if (bodyStr) hdrs['Content-Type'] = hdrs['Content-Type'] || 'application/json'
        lines.push('headers = ' + repr(hdrs))
      }
      if (bodyStr) lines.push('payload = ' + repr(bodyStr))
      const kwargs: string[] = []
      if (Object.keys(headerObj).length || bodyStr) kwargs.push('headers=headers')
      if (bodyStr) kwargs.push('data=payload')
      lines.push(`response = requests.${method.toLowerCase()}(url${kwargs.length ? ', ' + kwargs.join(', ') : ''})`)
      lines.push('print(response.json())')
      return lines.join('\n')
    }

    case 'go': {
      const lines: string[] = ['package main', '', 'import (', '\t"fmt"', '\t"io"', '\t"net/http"']
      if (bodyStr) lines.push('\t"strings"')
      lines.push(')', '', 'func main() {')
      if (bodyStr) {
        lines.push(`\tbody := strings.NewReader(\`${bodyStr}\`)`)
        lines.push(`\treq, err := http.NewRequest("${method}", "${fullUrl}", body)`)
      } else {
        lines.push(`\treq, err := http.NewRequest("${method}", "${fullUrl}", nil)`)
      }
      lines.push('\tif err != nil {', '\t\tpanic(err)', '\t}')
      for (const [k, v] of Object.entries(headerObj)) {
        lines.push(`\treq.Header.Set("${k}", "${v}")`)
      }
      lines.push('\tresp, err := http.DefaultClient.Do(req)', '\tif err != nil {', '\t\tpanic(err)', '\t}')
      lines.push('\tdefer resp.Body.Close()', '\tb, _ := io.ReadAll(resp.Body)', '\tfmt.Println(string(b))', '}')
      return lines.join('\n')
    }

    case 'rust': {
      const lines: string[] = [
        'use reqwest;',
        '',
        '#[tokio::main]',
        'async fn main() -> Result<(), Box<dyn std::error::Error>> {',
      ]
      const client = '\tlet client = reqwest::Client::new();'
      const mutBuilder = `\tlet resp = client.request(reqwest::Method::${method.toUpperCase()}, "${fullUrl}")`
      const builderLines: string[] = []
      for (const [k, v] of Object.entries(headerObj)) {
        builderLines.push(`\t\t.header("${k}", "${v}")`)
      }
      if (bodyStr) {
        builderLines.push(`\t\t.header("Content-Type", "application/json")`)
        builderLines.push(`\t\t.body(r#"${bodyStr}"#.to_string())`)
      }
      builderLines.push('\t\t.send()')
      builderLines.push('\t\t.await?;')
      lines.push(client, mutBuilder, ...builderLines, '\tlet text = resp.text().await?;', '\tprintln!("{text}");', '\tOk(())', '}')
      return lines.join('\n')
    }
  }
}

function repr(v: unknown): string {
  if (typeof v === 'string') {
    return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  }
  return JSON.stringify(v, null, 2)
}
