import './ResponseDisplay.css'
import { useState } from 'react'
import type { ReactNode } from 'react'

type ResponseDisplayProps = {
  response: unknown
  loading: boolean
  error: string | null
}

const RESPONSE_PAGES = {
  Json: 'json',
  Table: 'table',
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

function formatCell(value: unknown) {
  if (value !== null && typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function columnWidth(column: string) {
  return Math.max(column.length * 2, column.length + 8)
}

function renderTable(response: unknown): ReactNode {
  if (Array.isArray(response)) {
    const rows: Record<string, unknown>[] = response.map((value) =>
      value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : { value },
    )
    const columns = [...new Set(rows.flatMap(Object.keys))]

    return rows.length ? (
      <table className="response__table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} style={{ width: `${columnWidth(column)}ch` }}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column} style={{ maxWidth: `${columnWidth(column)}ch` }}>
                  {formatCell(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : <p className="response__message">No rows.</p>
  }

  if (response !== null && typeof response === 'object') {
    return (
      <table className="response__table">
        <thead>
          <tr>
            <th style={{ width: `${columnWidth('Key')}ch` }}>Key</th>
            <th style={{ width: `${columnWidth('Value')}ch` }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(response).map(([key, value]) => (
            <tr key={key}>
              <th style={{ width: `${columnWidth(key)}ch` }}>{key}</th>
              <td style={{ maxWidth: `${columnWidth('Value')}ch` }}>{formatCell(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return <table className="response__table"><tbody><tr><th>Value</th><td>{formatCell(response)}</td></tr></tbody></table>
}

export default function ResponseDisplay({
  response,
  loading,
  error,
}: ResponseDisplayProps) {
  const [activePage, setActivePage] = useState('json')

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
        <>
          <div className="response__tabs" aria-label="Response views">
            {Object.entries(RESPONSE_PAGES).map(([label, page]) => (
              <button
                className={`response__tab${page === activePage ? ' response__tab--active' : ''}`}
                key={page}
                onClick={() => setActivePage(page)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          {activePage === 'json' ? (
            <pre className="response__body"><code>{highlightJson(response)}</code></pre>
          ) : (
            <div className="response__body">{renderTable(response)}</div>
          )}
        </>
      )}
    </section>
  )
}
