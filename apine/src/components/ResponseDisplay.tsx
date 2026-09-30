import './ResponseDisplay.css'

type ResponseDisplayProps = {
  response: unknown
  loading: boolean
  error: string | null
}

function formatResponse(response: unknown) {
  if (typeof response === 'string') {
    return response
  }

  return JSON.stringify(response, null, 2)
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
        <pre className="response__body"><code>{formatResponse(response)}</code></pre>
      )}
    </section>
  )
}
