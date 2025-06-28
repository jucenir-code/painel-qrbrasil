'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface Placa {
  id: number
  nomeEmpresa: string
  cnpj: string
  endereco: string
  email: string
  whatsapp: string
  qrCodeUrl?: string
  qrCodeData?: string
  createdAt: string
}

function maskCNPJ(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

function maskWhatsApp(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

export default function Dashboard() {
  const router = useRouter()
  const [placas, setPlacas] = useState<Placa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showQrForm, setShowQrForm] = useState(false)
  const [selectedPlaca, setSelectedPlaca] = useState<Placa | null>(null)
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    cnpj: '',
    endereco: '',
    email: '',
    whatsapp: ''
  })
  const [qrUrl, setQrUrl] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showQrGeneral, setShowQrGeneral] = useState(false)
  const [qrGeneralUrl, setQrGeneralUrl] = useState('')
  const [qrGeneralData, setQrGeneralData] = useState('')
  const [qrGeneralLoading, setQrGeneralLoading] = useState(false)
  const [qrGeneralError, setQrGeneralError] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [editPlaca, setEditPlaca] = useState<Placa | null>(null)
  const [editFormData, setEditFormData] = useState({
    nomeEmpresa: '',
    cnpj: '',
    endereco: '',
    email: '',
    whatsapp: ''
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    fetchPlacas()
  }, [])

  const fetchPlacas = async () => {
    try {
      const response = await fetch('/api/placas')
      if (response.ok) {
        const data = await response.json()
        setPlacas(data)
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error('Erro ao buscar placas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    }
  }

  const handleSubmitPlaca = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/placas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        showToast('success', 'Placa cadastrada com sucesso!')
        setFormData({
          nomeEmpresa: '',
          cnpj: '',
          endereco: '',
          email: '',
          whatsapp: ''
        })
        setShowForm(false)
        fetchPlacas()
      } else {
        setError(data.error || 'Erro ao cadastrar placa')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQrCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlaca) return

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placaId: selectedPlaca.id,
          url: qrUrl
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast('success', 'QR Code gerado com sucesso!')
        setQrUrl('')
        setShowQrForm(false)
        setSelectedPlaca(null)
        fetchPlacas()
      } else {
        setError(data.error || 'Erro ao gerar QR Code')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newValue = value
    if (name === 'cnpj') newValue = maskCNPJ(value)
    if (name === 'whatsapp') newValue = maskWhatsApp(value)
    setFormData({
      ...formData,
      [name]: newValue
    })
  }

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newValue = value
    if (name === 'cnpj') newValue = maskCNPJ(value)
    if (name === 'whatsapp') newValue = maskWhatsApp(value)
    setEditFormData({
      ...editFormData,
      [name]: newValue
    })
  }

  const handleEditPlaca = (placa: Placa) => {
    setEditPlaca(placa)
    setEditFormData({
      nomeEmpresa: placa.nomeEmpresa,
      cnpj: placa.cnpj,
      endereco: placa.endereco,
      email: placa.email,
      whatsapp: placa.whatsapp
    })
    setShowEditForm(true)
  }

  const handleSubmitEditPlaca = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPlaca) return
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch(`/api/placas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editPlaca.id, ...editFormData })
      })
      const data = await response.json()
      if (response.ok) {
        showToast('success', 'Placa editada com sucesso!')
        setShowEditForm(false)
        setEditPlaca(null)
        fetchPlacas()
      } else {
        setError(data.error || 'Erro ao editar placa')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para gerar QR Code geral
  const handleGenerateQrGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setQrGeneralLoading(true)
    setQrGeneralError('')
    setQrGeneralData('')
    try {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: qrGeneralUrl, placaId: null })
      })
      const data = await res.json()
      if (res.ok && data.qrCode) {
        setQrGeneralData(data.qrCode)
      } else {
        setQrGeneralError(data.error || 'Erro ao gerar QR Code')
      }
    } catch {
      setQrGeneralError('Erro de conexão. Tente novamente.')
    } finally {
      setQrGeneralLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading && placas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-700">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-6 px-2">
      {/* Header */}
      <header className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center sm:text-left tracking-tight">Painel QR Brasil</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-1.5 rounded-md text-sm font-semibold shadow transition w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          Sair
        </button>
      </header>

      <main className="w-full max-w-3xl mx-auto">
        {/* Mensagens */}
        {toast && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-base transition-all
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
            style={{ minWidth: 220, maxWidth: 350, textAlign: 'center' }}
          >
            {toast.message}
          </div>
        )}

        {/* Botões de ação */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl text-lg font-bold shadow transition w-full sm:w-auto justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Cadastrar Nova Placa
          </button>
          <button
            onClick={() => setShowQrGeneral(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-bold shadow transition w-full sm:w-auto justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4l3 8 4-16 3 8h4" /></svg>
            Gerar QR Code
          </button>
        </div>

        {/* Lista de placas */}
        {placas.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center mt-8">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma placa cadastrada</h2>
            <p className="text-gray-500">Clique em "Cadastrar Nova Placa" para adicionar a primeira empresa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {placas.map((placa) => (
              <div key={placa.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">{placa.nomeEmpresa}</h3>
                  <p className="text-sm text-gray-500 text-center">CNPJ: {placa.cnpj}</p>
                  <p className="text-sm text-gray-500 text-center">Email: {placa.email}</p>
                  <p className="text-sm text-gray-500 text-center">WhatsApp: {placa.whatsapp}</p>
                  <p className="text-sm text-gray-500 text-center">Endereço: {placa.endereco}</p>
                  <p className="text-xs text-gray-400 text-center mt-1">Criada em: {format(new Date(placa.createdAt), 'dd/MM/yyyy')}</p>
                  {placa.qrCodeUrl && (
                    <p className="text-sm text-green-600 text-center mt-1">
                      QR Code: {placa.qrCodeUrl}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedPlaca(placa); setShowQrForm(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow transition w-full justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4l3 8 4-16 3 8h4" /></svg>
                  Gerar QR Code
                </button>
                {placa.qrCodeData && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={placa.qrCodeData}
                      alt="QR Code"
                      className="w-32 h-32 mt-2 rounded shadow"
                    />
                    <a
                      href={placa.qrCodeData}
                      download={`qrcode-${placa.id}.png`}
                      className="mt-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow transition"
                    >
                      Salvar QR Code
                    </a>
                  </div>
                )}
                <button
                  onClick={() => handleEditPlaca(placa)}
                  className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs font-medium shadow transition mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l10.293-10.293a1 1 0 00-1.414-1.414L3 17z" /></svg>
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal Cadastro de Placa */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Cadastrar Nova Placa
                </h3>
                <form onSubmit={handleSubmitPlaca} className="space-y-4">
                  <div>
                    <input
                      name="nomeEmpresa"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Nome da Empresa"
                      value={formData.nomeEmpresa}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <input
                      name="cnpj"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="CNPJ"
                      value={formData.cnpj}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <textarea
                      name="endereco"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Endereço"
                      rows={3}
                      value={formData.endereco}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <input
                      name="whatsapp"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="WhatsApp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gerar QR Code */}
        {showQrForm && selectedPlaca && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Gerar QR Code para {selectedPlaca.nomeEmpresa}
                </h3>
                <form onSubmit={handleSubmitQrCode} className="space-y-4">
                  <div>
                    <input
                      type="url"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="URL para o QR Code"
                      value={qrUrl}
                      onChange={(e) => setQrUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? 'Gerando...' : 'Gerar QR Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQrForm(false)
                        setSelectedPlaca(null)
                        setQrUrl('')
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal QR Code Geral */}
        {showQrGeneral && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Gerar QR Code para uma Placa
                </h3>
                <form onSubmit={handleGenerateQrGeneral} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Placa</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      value={selectedPlaca ? selectedPlaca.id : ''}
                      onChange={e => {
                        const placa = placas.find(p => p.id === Number(e.target.value))
                        setSelectedPlaca(placa || null)
                      }}
                    >
                      <option value="">Selecione uma placa</option>
                      {placas.map((placa) => (
                        <option key={placa.id} value={placa.id}>{placa.nomeEmpresa}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="url"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Digite a URL para gerar o QR Code"
                      value={qrGeneralUrl}
                      onChange={e => setQrGeneralUrl(e.target.value)}
                    />
                  </div>
                  {qrGeneralError && (
                    <div className="rounded-md bg-red-50 p-2 text-center text-red-700 text-sm">{qrGeneralError}</div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={qrGeneralLoading || !selectedPlaca}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {qrGeneralLoading ? 'Gerando...' : 'Gerar QR Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQrGeneral(false)
                        setQrGeneralUrl('')
                        setQrGeneralData('')
                        setQrGeneralError('')
                        setSelectedPlaca(null)
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
                {qrGeneralData && (
                  <div className="flex flex-col items-center mt-4 gap-2">
                    <img src={qrGeneralData} alt="QR Code" className="w-40 h-40" />
                    <a href={qrGeneralData} download="qrcode.png" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow transition">Salvar QR Code</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Edição de Placa */}
        {showEditForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Placa</h3>
                <form onSubmit={handleSubmitEditPlaca} className="space-y-4">
                  <div>
                    <input
                      name="nomeEmpresa"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Nome da Empresa"
                      value={editFormData.nomeEmpresa}
                      onChange={handleChangeEdit}
                    />
                  </div>
                  <div>
                    <input
                      name="cnpj"
                      type="text"
                      required
                      maxLength={18}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="CNPJ"
                      value={editFormData.cnpj}
                      onChange={handleChangeEdit}
                    />
                  </div>
                  <div>
                    <textarea
                      name="endereco"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Endereço"
                      rows={3}
                      value={editFormData.endereco}
                      onChange={handleChangeEdit}
                    />
                  </div>
                  <div>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Email"
                      value={editFormData.email}
                      onChange={handleChangeEdit}
                    />
                  </div>
                  <div>
                    <input
                      name="whatsapp"
                      type="text"
                      required
                      maxLength={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="WhatsApp"
                      value={editFormData.whatsapp}
                      onChange={handleChangeEdit}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 