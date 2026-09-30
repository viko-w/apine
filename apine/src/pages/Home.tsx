import { useState } from 'react'
import UrlFetch from '../components/UrlFetch'
import ResponseDisplay from '../components/ResponseDisplay'
import './Home.css'

function Home() {
  const [response, setResponse] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <UrlFetch
        onResponse={setResponse}
        onLoadingChange={setLoading}
        onError={setError}
      />
      <ResponseDisplay response={response} loading={loading} error={error} />
    </>
  )
}

export default Home
