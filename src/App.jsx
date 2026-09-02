import './App.css'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <main style={{ padding: 0 }}>
      <Outlet />
    </main>
  )
}

export default App
