import './ResponseDisplay.css'
import { useLayoutEffect, useRef, useState } from 'react'
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

function renderCell(value: unknown, indent = 0, colorValue = false): ReactNode {
  if (value === null) {
    return <span className="response__token response__token--null">null</span>
  }

  if (typeof value !== 'object') {
    const tokenClass = typeof value === 'boolean'
      ? 'response__token--boolean'
      : colorValue && typeof value === 'string'
      ? 'response__token--string'
      : colorValue && typeof value === 'number'
        ? 'response__token--number'
        : ''
    return <span className={`response__token ${tokenClass}`}>{String(value)}</span>
  }

  const entries = Array.isArray(value)
    ? value.map((entry, index) => [index, entry] as const)
    : Object.entries(value)

  if (!entries.length) {
    return <span className="response__token response__token--punctuation">{Array.isArray(value) ? '[]' : '{}'}</span>
  }

  return entries.map(([key, entry], index) => {
    const nested = entry !== null && typeof entry === 'object'
    return (
      <span key={`${key}-${index}`}>
        {index > 0 && '\n'}
        {' '.repeat(indent)}
        <span className="response__token response__token--key">{key}:</span>
        {nested ? (
          <>
            {'\n'}
            {renderCell(entry, indent + 2, true)}
          </>
        ) : (
          <> {renderCell(entry, 0, true)}</>
        )}
      </span>
    )
  })
}

function formatHeader(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value
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
              <th key={column}>{formatHeader(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
              <tr key={index}>
              {columns.map((column) => (
                <td key={column}>{renderCell(row[column])}</td>
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
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(response).map(([key, value]) => (
            <tr key={key}>
            <th>{formatHeader(key)}</th>
            <td>{renderCell(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return <table className="response__table"><tbody><tr><th>Value</th><td>{renderCell(response)}</td></tr></tbody></table>
}

function ScrollableResponse({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const updateScrollEdges = () => {
      setScrollEdges({
        left: element.scrollLeft > 1,
        right: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      })
    }

    updateScrollEdges()
    element.addEventListener('scroll', updateScrollEdges, { passive: true })
    window.addEventListener('resize', updateScrollEdges)
    const observer = new ResizeObserver(updateScrollEdges)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)

    return () => {
      element.removeEventListener('scroll', updateScrollEdges)
      window.removeEventListener('resize', updateScrollEdges)
      observer.disconnect()
    }
  }, [children])

  return (
    <div
      className={`response__scroll${scrollEdges.left ? ' response__scroll--left' : ''}${scrollEdges.right ? ' response__scroll--right' : ''}`}
    >
      <div className={className} ref={ref}>
        {children}
      </div>
    </div>
  )
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
            <ScrollableResponse className="response__body"><pre><code>{highlightJson(response)}</code></pre></ScrollableResponse>
          ) : (
            <ScrollableResponse className="response__body response__body--table">{renderTable(response)}</ScrollableResponse>
          )}
        </>
      )}
    </section>
  )
}
