import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import Particles from './components/Particles'
import ScrollToTop from './components/ScrollToTop'
import Tela1Idade from './pages/Tela1Idade'
import Tela2Cor from './pages/Tela2Cor'
import Tela3Historia from './pages/Tela3Historia'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Particles />
        <Routes>
          <Route path="/" element={<Tela1Idade />} />
          <Route path="/roleta" element={<Tela2Cor />} />
          <Route path="/historia" element={<Tela3Historia />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="app-footer">🎲 Jogo de tabuleiro • O que há de BOM?</footer>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
