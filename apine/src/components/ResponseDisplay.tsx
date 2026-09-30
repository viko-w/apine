import './ResponseDisplay.css'
import type { ReactNode } from 'react'

type ResponseDisplayProps = {
  response: unknown
  loading: boolean
  error: string | null
}

function formatResponse(response: unknown) {
  if (typeof response === 'string') {
    return response
  }

  return JSON.stringify(response, null, 2) ?? String(response)
}

function highlightJson(response: unknown): ReactNode {
  if (typeof response === 'string') {
    return response
  }

  const formattedResponse = formatResponse(response)
  const tokenPattern = /("(?:\\.|[^"\\])*")|(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\],:])/g
  const tokens: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenPattern.exec(formattedResponse)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(formattedResponse.slice(lastIndex, match.index))
    }

    const token = match[0]
    const nextNonWhitespace = formattedResponse.slice(tokenPattern.lastIndex).match(/\S/)?.[0]
    let tokenClass = 'response__token'

    if (match[1]) {
      tokenClass += nextNonWhitespace === ':' ? ' response__token--key' : ' response__token--string'
    } else if (match[2]) {
      tokenClass += ' response__token--number'
    } else if (match[3]) {
      tokenClass += ' response__token--boolean'
    } else if (match[4]) {
      tokenClass += ' response__token--null'
    } else {
      tokenClass += ' response__token--punctuation'
    }

    tokens.push(
      <span className={tokenClass} key={`${match.index}-${token}`}>
        {token}
      </span>,
    )
    lastIndex = tokenPattern.lastIndex
  }

  if (lastIndex < formattedResponse.length) {
    tokens.push(formattedResponse.slice(lastIndex))
  }

  return tokens
}

export default function ResponseDisplay({
  response,
  loading,
  error,
}: ResponseDisplayProps) {
  return (
    <section className="response" aria-live="polite" aria-busy={loading}>
      <div className="response__header">
        <h2>Response</h2>
        {loading && <span className="response__status">Loading…</span>}
      </div>

      {error ? (
        <p className="response__message response__message--error">{error}</p>
      ) : response === null ? (
        <p className="response__message">Send a request to see its response.</p>
      ) : (
        <pre className="response__body"><code>{highlightJson(response)}</code></pre>
      )}
    </section>
  )
}
