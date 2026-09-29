import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import './App.css'

function App() {
  const { pathname } = useLocation()

  return (
    <div className="shell">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <Navbar />
      <main id="content" className="main" tabIndex={-1}>
        <div className="page" key={pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App
