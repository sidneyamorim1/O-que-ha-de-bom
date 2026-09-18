import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAIXAS_ETARIAS } from '../constants/gameData'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabaseClient'
import logo from '../assets/logo/logo.webp'

export default function Tela1Idade() {
  const navigate = useNavigate()
  const { setSelectedAge, setSelectedColor } = useApp()
  const [rodape, setRodape] = useState(null) // null | 'voltar' | 'sair'

  useEffect(() => {
    let active = true

    async function carregarRodape() {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id
      if (!userId) return

      const { data } = await supabase.from('usuarios').select('papel').eq('id', userId).maybeSingle()
      if (active) setRodape(data?.papel === 'aluno' ? 'sair' : 'voltar')
    }

    carregarRodape()
    return () => {
      active = false
    }
  }, [])

  function handleSelect(faixa) {
    setSelectedColor(null)
    setSelectedAge(faixa)
    navigate('/roleta')
  }

  async function handleSair() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="page page--single-screen">
      <div className="card card--idade">
        <div className="titulo-wrapper titulo-wrapper--compacto">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo titulo-logo--otimizado" />
          <h1 className="titulo titulo--principal">
            O que há de <span>BOM?</span>
          </h1>
        </div>
        <p className="subtitulo subtitulo--clean">Selecione sua faixa etária para começar:</p>

        <div className="grid-idades">
          {FAIXAS_ETARIAS.map((faixa) => (
            <button
              key={faixa.value}
              type="button"
              className="btn-idade"
              onClick={() => handleSelect(faixa.value)}
            >
              <span className="btn-idade__emoji">{faixa.emoji}</span>
              <span className="btn-idade__label">{faixa.label} anos</span>
              <span className="btn-idade__hint">{faixa.hint}</span>
            </button>
          ))}
        </div>

        {rodape === 'voltar' && (
          <button type="button" className="btn-voltar" onClick={() => navigate('/escolha')}>
            ← Voltar para Escolha de Perfil
          </button>
        )}
        {rodape === 'sair' && (
          <button type="button" className="btn-voltar" onClick={handleSair}>
            Encerrar sessão
          </button>
        )}
      </div>
    </div>
  )
}
