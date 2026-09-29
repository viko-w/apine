import React from 'react'
import './Home.css'

function Home() {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  const [method, setMethod] = React.useState('GET')
  const [url, setUrl] = React.useState('')
  const [isMethodMenuOpen, setIsMethodMenuOpen] = React.useState(false)
  const [highlightedMethodIndex, setHighlightedMethodIndex] = React.useState(0)
  const methodMenuRef = React.useRef<HTMLDivElement>(null)
  const methodTriggerRef = React.useRef<HTMLButtonElement>(null)
  const methodOptionRefs = React.useRef<Array<HTMLButtonElement | null>>([])

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
          aria-label="HTTP method"
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
      <button className="url-bar__send button" type="button">
        SEND
      </button>
    </div>
  )
}

export default Home
