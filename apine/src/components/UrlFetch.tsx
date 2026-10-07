import React from "react"
import { flushSync } from "react-dom"
import './UrlFetch.css'

type UrlFetchProps = {
  onResponse: (response: unknown) => void
  onLoadingChange: (loading: boolean) => void
  onError: (error: string | null) => void
}

type RequestRow = {
  name: string
  value: string
}

const REQUEST_TABS = [
  {
    id: 'headers',
    label: 'Request headers',
    countKey: 'headers',
    countNoun: 'headers',
  },
  {
    id: 'params',
    label: 'Parameters',
    countKey: 'params',
    countNoun: 'parameters',
  },
] as const

type RowEditorProps = {
  idPrefix: string
  rows: RequestRow[]
  rowNoun: string
  nameLabel: string
  valueLabel: string
  namePlaceholder: string
  valuePlaceholder: string
  emptyText: string
  addLabel: string
  flagDuplicateNames: boolean
  onChange: (index: number, field: keyof RequestRow, value: string) => void
  onRemove: (index: number) => void
  onAdd: () => void
}

function RowEditor({
  idPrefix,
  rows,
  rowNoun,
  nameLabel,
  valueLabel,
  namePlaceholder,
  valuePlaceholder,
  emptyText,
  addLabel,
  flagDuplicateNames,
  onChange,
  onRemove,
  onAdd,
}: RowEditorProps) {
  const addButtonRef = React.useRef<HTMLButtonElement>(null)
  const removeRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const nameRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const issues = rows.map((row, index) => {
    const name = row.name.trim()

    if (!name) {
      return row.value.trim()
        ? `Not sent — this row has no name.`
        : null
    }

    if (!flagDuplicateNames) {
      return null
    }

    const normalizedName = name.toLowerCase()
    const isLastOfItsName =
      rows.reduce(
        (last, { name: otherName }, otherIndex) =>
          otherName.trim().toLowerCase() === normalizedName ? otherIndex : last,
        -1,
      ) === index

    return isLastOfItsName
      ? null
      : `Not sent — only the last ${name} value is sent.`
  })

  const skippedCount = issues.filter(Boolean).length

  const handleRemove = (index: number) => {
    const nextFocusIndex =
      rows.length === 1 ? -1 : Math.min(index, rows.length - 2)

    flushSync(() => {
      onRemove(index)
    })

    const nextTarget =
      nextFocusIndex === -1
        ? addButtonRef.current
        : removeRefs.current[nextFocusIndex]
    nextTarget?.focus()
  }

  const handleAdd = () => {
    flushSync(() => {
      onAdd()
    })

    nameRefs.current[rows.length]?.focus()
  }

  return (
    <div className="rows">
      {rows.length === 0 ? (
        <p className="rows__empty">{emptyText}</p>
      ) : (
        <>
          <div className="rows__labels">
            <span id={`${idPrefix}-label-name`}>{nameLabel}</span>
            <span id={`${idPrefix}-label-value`}>{valueLabel}</span>
            <span />
          </div>
          {rows.map((row, index) => {
            const issue = issues[index]
            const name = row.name.trim()

            return (
              <div
                className={`rows__row${issue ? ' rows__row--skipped' : ''}`}
                key={index}
                role="group"
                aria-label={
                  name ? `${rowNoun} ${name}` : `${rowNoun} without a name`
                }
              >
                <label className="rows__cell">
                  <span className="rows__cell-label">Name</span>
                  <input
                    type="text"
                    placeholder={namePlaceholder}
                    aria-labelledby={`${idPrefix}-label-name`}
                    aria-invalid={issue ? true : undefined}
                    aria-describedby={
                      issue ? `${idPrefix}-issue-${index}` : undefined
                    }
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    value={row.name}
                    ref={(element) => {
                      nameRefs.current[index] = element
                    }}
                    onChange={(event) =>
                      onChange(index, 'name', event.target.value)
                    }
                  />
                </label>
                <label className="rows__cell">
                  <span className="rows__cell-label">Value</span>
                  <input
                    type="text"
                    placeholder={valuePlaceholder}
                    aria-labelledby={`${idPrefix}-label-value`}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    value={row.value}
                    onChange={(event) =>
                      onChange(index, 'value', event.target.value)
                    }
                  />
                </label>
                <button
                  className="rows__remove"
                  type="button"
                  aria-label={`Remove ${name || 'unnamed'} ${rowNoun}`}
                  ref={(element) => {
                    removeRefs.current[index] = element
                  }}
                  onClick={() => handleRemove(index)}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
                  </svg>
                </button>
                {issue && (
                  <p className="rows__issue" id={`${idPrefix}-issue-${index}`}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M8 2.5l5.5 10.5h-11L8 2.5z" />
                      <path d="M8 6.75v3M8 11.4v0.6" />
                    </svg>
                    {issue}
                  </p>
                )}
              </div>
            )
          })}
          <p className="visually-hidden" role="status">
            {skippedCount > 0 &&
              `${skippedCount} ${
                skippedCount === 1 ? rowNoun : `${rowNoun}s`
              } will not be sent.`}
          </p>
        </>
      )}
      <button
        className="rows__add"
        type="button"
        ref={addButtonRef}
        onClick={handleAdd}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 3.5v9M3.5 8h9" />
        </svg>
        {addLabel}
      </button>
    </div>
  )
}

function withParams(requestUrl: string, params: RequestRow[]) {
  const activeParams = params.filter(({ name }) => name.trim())

  if (activeParams.length === 0) {
    return requestUrl
  }

  const hashIndex = requestUrl.indexOf('#')
  const hash = hashIndex === -1 ? '' : requestUrl.slice(hashIndex)
  const base = hashIndex === -1 ? requestUrl : requestUrl.slice(0, hashIndex)
  const queryIndex = base.indexOf('?')
  const path = queryIndex === -1 ? base : base.slice(0, queryIndex)
  const existingQuery = queryIndex === -1 ? '' : base.slice(queryIndex + 1)
  const added = new URLSearchParams(
    activeParams.map(({ name, value }) => [name.trim(), value]),
  ).toString()

  return `${path}?${existingQuery ? `${existingQuery}&` : ''}${added}${hash}`
}

export default function UrlFetch({
  onResponse,
  onLoadingChange,
  onError,
}: UrlFetchProps) {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  const [method, setMethod] = React.useState('GET')
  const [url, setUrl] = React.useState('')
  const [headers, setHeaders] = React.useState<RequestRow[]>([])
  const [params, setParams] = React.useState<RequestRow[]>([])
  const [activeRequestTab, setActiveRequestTab] = React.useState<
    (typeof REQUEST_TABS)[number]['id']
  >(REQUEST_TABS[0].id)
  const [isRequestPanelOpen, setIsRequestPanelOpen] = React.useState(false)
  const requestToggleRef = React.useRef<HTMLButtonElement>(null)
  const [isMethodMenuOpen, setIsMethodMenuOpen] = React.useState(false)
  const [highlightedMethodIndex, setHighlightedMethodIndex] = React.useState(0)
  const methodMenuRef = React.useRef<HTMLDivElement>(null)
  const methodTriggerRef = React.useRef<HTMLButtonElement>(null)
  const methodOptionRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const requestTabRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  const sentHeaderCount = new Set(
    headers
      .map(({ name }) => name.trim().toLowerCase())
      .filter(Boolean),
  ).size

  const sentParamCount = params.filter(({ name }) => name.trim()).length

  const tabCounts: Record<string, number> = {
    headers: sentHeaderCount,
    params: sentParamCount,
  }

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
      const response = await fetch(withParams(requestUrl, params), {
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

  const updateRow = (
    setRows: React.Dispatch<React.SetStateAction<RequestRow[]>>,
    index: number,
    field: keyof RequestRow,
    value: string,
  ) => {
    setRows((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    )
  }

  const removeRow = (
    setRows: React.Dispatch<React.SetStateAction<RequestRow[]>>,
    index: number,
  ) => {
    setRows((currentRows) =>
      currentRows.filter((_, rowIndex) => rowIndex !== index),
    )
  }

  const addRow = (
    setRows: React.Dispatch<React.SetStateAction<RequestRow[]>>,
  ) => {
    setRows((currentRows) => [...currentRows, { name: '', value: '' }])
  }

  const selectRequestTab = (index: number) => {
    setActiveRequestTab(REQUEST_TABS[index].id)
    setIsRequestPanelOpen(true)
    requestTabRefs.current[index]?.focus()
  }

  const handleRequestTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex = index

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % REQUEST_TABS.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + REQUEST_TABS.length) % REQUEST_TABS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = REQUEST_TABS.length - 1
    } else {
      return
    }

    event.preventDefault()
    selectRequestTab(nextIndex)
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
      <section className="request">
        <div className="request__tabs" role="tablist" aria-label="Request">
          {REQUEST_TABS.map((tab, index) => {
            const isActive = tab.id === activeRequestTab

            return (
              <button
                className={`request__tab${isActive ? ' request__tab--active' : ''}`}
                type="button"
                role="tab"
                id={`request-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`request-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                key={tab.id}
                ref={(element) => {
                  requestTabRefs.current[index] = element
                }}
                onClick={() => selectRequestTab(index)}
                onKeyDown={(event) => handleRequestTabKeyDown(event, index)}
              >
                <span className="request__tab-label">{tab.label}</span>
                {tabCounts[tab.countKey] > 0 && (
                  <span className="request__tab-count">
                    {tabCounts[tab.countKey]}
                    <span className="visually-hidden">
                      {' '}
                      {tab.countNoun} will be sent
                    </span>
                  </span>
                )}
              </button>
            )
          })}
          <button
            className="request__toggle"
            type="button"
            ref={requestToggleRef}
            aria-expanded={isRequestPanelOpen}
            aria-controls="request-panels"
            aria-label={
              isRequestPanelOpen
                ? 'Hide request options'
                : 'Show request options'
            }
            onClick={() => setIsRequestPanelOpen((open) => !open)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.5 6.5l3.5 3.5 3.5-3.5" />
            </svg>
          </button>
        </div>
        <div className="request__panels" hidden={!isRequestPanelOpen}>
          {REQUEST_TABS.map((tab) => (
            <div
              className="request__panel"
              role="tabpanel"
              key={tab.id}
              id={`request-panel-${tab.id}`}
              aria-labelledby={`request-tab-${tab.id}`}
              tabIndex={0}
              hidden={tab.id !== activeRequestTab}
            >
              {tab.id === 'headers' ? (
                <RowEditor
                  idPrefix="headers"
                  rows={headers}
                  rowNoun="header"
                  nameLabel="Header name"
                  valueLabel="Header value"
                  namePlaceholder="Content-Type"
                  valuePlaceholder="application/json"
                  emptyText="No headers yet. The request goes out without any."
                  addLabel="Add header"
                  flagDuplicateNames
                  onChange={(index, field, value) =>
                    updateRow(setHeaders, index, field, value)
                  }
                  onRemove={(index) => removeRow(setHeaders, index)}
                  onAdd={() => addRow(setHeaders)}
                />
              ) : (
                <RowEditor
                  idPrefix="params"
                  rows={params}
                  rowNoun="parameter"
                  nameLabel="Parameter name"
                  valueLabel="Parameter value"
                  namePlaceholder="page"
                  valuePlaceholder="1"
                  emptyText="No parameters yet. The URL is sent exactly as typed."
                  addLabel="Add parameter"
                  flagDuplicateNames={false}
                  onChange={(index, field, value) =>
                    updateRow(setParams, index, field, value)
                  }
                  onRemove={(index) => removeRow(setParams, index)}
                  onAdd={() => addRow(setParams)}
                />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
