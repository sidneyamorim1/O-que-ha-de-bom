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
import Login from './pages/Login'
import EscolhaPerfil from './pages/EscolhaPerfil'
import EscolhaFaixaProfessor from './pages/EscolhaFaixaProfessor'
import ProfessorCor from './pages/ProfessorCor'
import ProfessorHistoria from './pages/ProfessorHistoria'
import AdminHistoriasProfessores from './pages/AdminHistoriasProfessores'
import AdminUsuarios from './pages/AdminUsuarios'
import AdminVozes from './pages/AdminVozes'
import AdminImportacao from './pages/AdminImportacao'

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
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/professores"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminHistoriasProfessores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminUsuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vozes"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminVozes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/importacao"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminImportacao />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/escolha"
            element={
              <ProtectedRoute redirectTo="/login">
                <EscolhaPerfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/escolha/professores"
            element={
              <ProtectedRoute redirectTo="/login">
                <EscolhaFaixaProfessor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professores/:faixa/cor"
            element={
              <ProtectedRoute redirectTo="/login">
                <ProfessorCor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professores/:faixa/:cor"
            element={
              <ProtectedRoute redirectTo="/login">
                <ProfessorHistoria />
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
