import { useState } from 'react'
import UrlFetch from '../components/UrlFetch'
import ResponseDisplay from '../components/ResponseDisplay'
import Sidebar from '../components/Sidebar'
import './Home.css'

function Home() {
  const [response, setResponse] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
    <div className='flex main-body'>
      <div className='fetch-body'>
        <UrlFetch
          onResponse={setResponse}
          onLoadingChange={setLoading}
          onError={setError}
        />
        <ResponseDisplay response={response} loading={loading} error={error} />
      </div>
      <div className='sidebar-body'>
        <Sidebar />
      </div>
    </div>
    </>
  )
}

export default Home
