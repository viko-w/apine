import React from 'react'
import './Home.css'

function Home() {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  const [method, setMethod] = React.useState('GET')
  const [url, setUrl] = React.useState('')

  return (
    <div className="url-bar">
      <div className="url-bar__method">
        <select
          className="url-bar__select"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          aria-label="HTTP method"
        >
          {methods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
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