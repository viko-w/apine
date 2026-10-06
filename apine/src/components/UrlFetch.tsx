import React from "react"
import { flushSync } from "react-dom"
import './UrlFetch.css'

type UrlFetchProps = {
  onResponse: (response: unknown) => void
  onLoadingChange: (loading: boolean) => void
  onError: (error: string | null) => void
}

type RequestHeader = {
  name: string
  value: string
}

export default function UrlFetch({
  onResponse,
  onLoadingChange,
  onError,
}: UrlFetchProps) {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  const [method, setMethod] = React.useState('GET')
  const [url, setUrl] = React.useState('')
  const [headers, setHeaders] = React.useState<RequestHeader[]>([])
  const [isMethodMenuOpen, setIsMethodMenuOpen] = React.useState(false)
  const [highlightedMethodIndex, setHighlightedMethodIndex] = React.useState(0)
  const methodMenuRef = React.useRef<HTMLDivElement>(null)
  const methodTriggerRef = React.useRef<HTMLButtonElement>(null)
  const methodOptionRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const addHeaderButtonRef = React.useRef<HTMLButtonElement>(null)
  const removeHeaderRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const headerNameRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const sentHeaderCount = new Set(
    headers
      .map(({ name }) => name.trim().toLowerCase())
      .filter(Boolean),
  ).size

  const headerIssues = headers.map((header, index) => {
    const name = header.name.trim()

    if (!name) {
      return header.value.trim()
        ? 'Not sent — this row has no name.'
        : null
    }

    const normalizedName = name.toLowerCase()
    const isLastOfItsName = headers.reduce(
      (last, { name: otherName }, otherIndex) =>
        otherName.trim().toLowerCase() === normalizedName ? otherIndex : last,
      -1,
    ) === index

    return isLastOfItsName
      ? null
      : `Not sent — only the last ${name} value is sent.`
  })

  const skippedHeaderCount = headerIssues.filter(Boolean).length

  async function fetchAPIData(requestUrl: string) {
    if (!requestUrl) {
      onError('Enter a URL before sending the request.')
      return
    }

    onLoadingChange(true)
    onError(null)

    try {
      const requestHeaders = Object.fromEntries(
        headers
          .filter(({ name }) => name.trim())
          .map(({ name, value }) => [name.trim(), value]),
      )
      const response = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
      })
      const content = await response.json()

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`)
      }

      onResponse(content)
    } catch (requestError) {
      onError(
        requestError instanceof Error
          ? requestError.message
          : 'The request could not be completed.',
      )
    } finally {
      onLoadingChange(false)
    }
  }

  const updateHeader = (
    index: number,
    field: keyof RequestHeader,
    value: string,
  ) => {
    setHeaders((currentHeaders) =>
      currentHeaders.map((header, headerIndex) =>
        headerIndex === index ? { ...header, [field]: value } : header,
      ),
    )
  }

  const removeHeader = (index: number) => {
    const nextFocusIndex =
      headers.length === 1 ? -1 : Math.min(index, headers.length - 2)

    flushSync(() => {
      setHeaders((currentHeaders) =>
        currentHeaders.filter((_, headerIndex) => headerIndex !== index),
      )
    })

    const nextTarget =
      nextFocusIndex === -1
        ? addHeaderButtonRef.current
        : removeHeaderRefs.current[nextFocusIndex]
    nextTarget?.focus()
  }

  const addHeader = () => {
    flushSync(() => {
      setHeaders((currentHeaders) => [
        ...currentHeaders,
        { name: '', value: '' },
      ])
    })

    headerNameRefs.current[headers.length]?.focus()
  }

  const closeMethodMenu = () => {
    setIsMethodMenuOpen(false)
  }

  const selectMethod = (nextMethod: string) => {
    setMethod(nextMethod)
    closeMethodMenu()
    methodTriggerRef.current?.focus()
  }

  const openMethodMenu = (index = methods.indexOf(method)) => {
    setHighlightedMethodIndex(index)
    setIsMethodMenuOpen(true)
  }

  const handleMethodTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isMethodMenuOpen) {
        closeMethodMenu()
      } else {
        openMethodMenu()
      }
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMethodMenu()
    }
  }

  const handleMethodOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMethodMenu()
      methodTriggerRef.current?.focus()
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectMethod(methods[index])
      return
    }

    let nextIndex = index

    if (event.key === 'ArrowDown') {
      nextIndex = (index + 1) % methods.length
    } else if (event.key === 'ArrowUp') {
      nextIndex = (index - 1 + methods.length) % methods.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = methods.length - 1
    } else {
      return
    }

    event.preventDefault()
    setHighlightedMethodIndex(nextIndex)
    methodOptionRefs.current[nextIndex]?.focus()
  }

  React.useEffect(() => {
    if (!isMethodMenuOpen) {
      return
    }

    methodOptionRefs.current[highlightedMethodIndex]?.focus()
  }, [isMethodMenuOpen, highlightedMethodIndex])

  React.useEffect(() => {
    if (!isMethodMenuOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!methodMenuRef.current?.contains(event.target as Node)) {
        closeMethodMenu()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isMethodMenuOpen])
  return (
    <div className="url-fetch">
      <div className="url-bar">
        <div
          className="url-bar__method"
          ref={methodMenuRef}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeMethodMenu()
            }
          }}
        >
          <button
            className="url-bar__trigger"
            type="button"
            ref={methodTriggerRef}
            aria-label={`HTTP method: ${method}`}
            aria-haspopup="menu"
            aria-expanded={isMethodMenuOpen}
            aria-controls="http-method-menu"
            onClick={() => {
              if (isMethodMenuOpen) {
                closeMethodMenu()
              } else {
                openMethodMenu()
              }
            }}
            onKeyDown={handleMethodTriggerKeyDown}
          >
            {method}
          </button>
          {isMethodMenuOpen && (
            <div
              className="url-bar__menu"
              id="http-method-menu"
              role="menu"
              aria-label="HTTP method"
            >
              {methods.map((m, index) => (
                <button
                  className="url-bar__option"
                  type="button"
                  role="menuitemradio"
                  aria-checked={method === m}
                  key={m}
                  ref={(element) => {
                    methodOptionRefs.current[index] = element
                  }}
                  onClick={() => selectMethod(m)}
                  onFocus={() => setHighlightedMethodIndex(index)}
                  onKeyDown={(event) => handleMethodOptionKeyDown(event, index)}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          className="url-bar__input"
          type="url"
          placeholder="https://example.com/api/v1/param1/param2"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Request URL"
        />
        <button
          className="url-bar__send button"
          type="button"
          onClick={() => fetchAPIData(url)}
        >
          SEND
        </button>
      </div>
      <details className="headers">
        <summary className="headers__summary">
          <span className="headers__label">Request headers</span>
          {sentHeaderCount > 0 && (
            <span className="headers__count">
              {sentHeaderCount}
              <span className="visually-hidden"> headers will be sent</span>
            </span>
          )}
        </summary>
        <div className="headers__panel">
          {headers.length === 0 ? (
            <p className="headers__empty">
              No headers yet. The request goes out without any.
            </p>
          ) : (
            <>
              <div className="headers__labels">
                <span id="headers-label-name">Header name</span>
                <span id="headers-label-value">Header value</span>
                <span />
              </div>
              {headers.map((header, index) => {
                const issue = headerIssues[index]
                const name = header.name.trim()

                return (
                  <div
                    className={`headers__row${issue ? ' headers__row--skipped' : ''}`}
                    key={index}
                    role="group"
                    aria-label={name ? `Header ${name}` : 'Header without a name'}
                  >
                    <label className="headers__cell">
                      <span className="headers__cell-label">Name</span>
                      <input
                        type="text"
                        placeholder="Content-Type"
                        aria-labelledby="headers-label-name"
                        aria-invalid={issue ? true : undefined}
                        aria-describedby={issue ? `headers-issue-${index}` : undefined}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={header.name}
                        ref={(element) => {
                          headerNameRefs.current[index] = element
                        }}
                        onChange={(event) =>
                          updateHeader(index, 'name', event.target.value)
                        }
                      />
                    </label>
                    <label className="headers__cell">
                      <span className="headers__cell-label">Value</span>
                      <input
                        type="text"
                        placeholder="application/json"
                        aria-labelledby="headers-label-value"
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        value={header.value}
                        onChange={(event) =>
                          updateHeader(index, 'value', event.target.value)
                        }
                      />
                    </label>
                    <button
                      className="headers__remove"
                      type="button"
                      aria-label={`Remove ${name || 'unnamed'} header`}
                      ref={(element) => {
                        removeHeaderRefs.current[index] = element
                      }}
                      onClick={() => removeHeader(index)}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
                      </svg>
                    </button>
                    {issue && (
                      <p className="headers__issue" id={`headers-issue-${index}`}>
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M8 2.5l5.5 10.5h-11L8 2.5z" />
                          <path d="M8 6.75v3M8 11.4v.6" />
                        </svg>
                        {issue}
                      </p>
                    )}
                  </div>
                )
              })}
              <p className="visually-hidden" role="status">
                {skippedHeaderCount > 0 &&
                  `${skippedHeaderCount} ${
                    skippedHeaderCount === 1 ? 'header' : 'headers'
                  } will not be sent.`}
              </p>
            </>
          )}
          <button
            className="headers__add"
            type="button"
            ref={addHeaderButtonRef}
            onClick={addHeader}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 3.5v9M3.5 8h9" />
            </svg>
            Add header
          </button>
        </div>
      </details>
    </div>
  )
}
