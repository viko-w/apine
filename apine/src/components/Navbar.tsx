import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: 'Home', end: true },
]

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <span className="navbar__mark">
          <img className="navbar__logo" src="/apine-logo.svg" alt="apine" />
        </span>
        <nav aria-label="Main">
          <ul className="navbar__links">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className="navbar__link">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
