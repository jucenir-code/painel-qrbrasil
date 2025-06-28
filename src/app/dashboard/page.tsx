'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import QRCode from 'qrcode'
import { listarPlacas, criarPlaca, atualizarPlaca, gerarQRCodeGeral } from '@/services/placas'
import { logout } from '@/services/api'

interface Placa {
  id: number
  nome_empresa: string
  descricao?: string
  url_destino?: string
  qr_code?: string
  created_at: string
}

// Função para formatar data com validação
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    console.log('Data vazia ou nula:', dateString)
    return 'Data não disponível'
  }
  
  console.log('Tentando formatar data:', dateString, 'Tipo:', typeof dateString)
  
  try {
    // Tentar criar Date diretamente
    let date = new Date(dateString)
    
    // Se falhou, tentar formatos específicos
    if (isNaN(date.getTime())) {
      // Tentar formato ISO sem timezone
      const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (isoMatch) {
        date = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`)
      } else {
        // Tentar formato brasileiro
        const brMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
        if (brMatch) {
          date = new Date(`${brMatch[3]}-${brMatch[2]}-${brMatch[1]}T00:00:00`)
        } else {
          console.error('Formato de data não reconhecido:', dateString)
          return 'Data inválida'
        }
      }
    }
    
    if (isNaN(date.getTime())) {
      console.error('Data inválida após parsing:', dateString)
      return 'Data inválida'
    }
    
    console.log('Data parseada com sucesso:', date)
    return format(date, 'dd/MM/yyyy')
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Data original:', dateString)
    return 'Data inválida'
  }
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
  const [formData, setFormData] = useState({
    nome_empresa: '',
    descricao: '',
    url_destino: ''
  })
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
    nome_empresa: '',
    descricao: '',
    url_destino: ''
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-qr' | 'without-qr'>('all')

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('token')
    console.log('Token no dashboard:', token)
    
    if (!token) {
      // Se não há token, salvar o token de teste (sem espaços)
      const testToken = '5A0IKx8jROXqpwZjKleKAlgy'
      localStorage.setItem('token', testToken)
      console.log('Token de teste salvo:', testToken)
    }
    
    fetchPlacas()
  }, [])

  const fetchPlacas = async () => {
    try {
      const data = await listarPlacas()
      console.log('Dados brutos da API:', data)
      
      // Garantir que os dados estão no formato correto
      const placasFormatadas = (data.data || []).map((placa: any) => {
        console.log('Placa individual:', placa)
        return {
          id: placa.id || 0,
          nome_empresa: placa.nome_empresa || '',
          descricao: placa.descricao || '',
          url_destino: placa.url_destino || '',
          qr_code: placa.qr_code || '',
          created_at: placa.created_at || ''
        }
      })
      
      console.log('Placas formatadas:', placasFormatadas)
      setPlacas(placasFormatadas)
    } catch (err: any) {
      console.error('Erro ao buscar placas:', err)
      if (err.message.includes('401') || err.message.includes('token')) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    logout()
  }

  const handleSubmitPlaca = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const data = await criarPlaca(formData)
      
      if (data.success) {
        showToast('success', 'Placa cadastrada com sucesso!')
        setFormData({
          nome_empresa: '',
          descricao: '',
          url_destino: ''
        })
        setShowForm(false)
        fetchPlacas()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar placa')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData({
      ...editFormData,
      [name]: value
    })
  }

  const handleEditPlaca = (placa: Placa) => {
    setEditPlaca(placa)
    setEditFormData({
      nome_empresa: placa.nome_empresa,
      descricao: placa.descricao || '',
      url_destino: placa.url_destino || ''
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
      const data = await atualizarPlaca(editPlaca.id, editFormData)
      
      if (data.success) {
        showToast('success', 'Placa atualizada com sucesso!')
        setShowEditForm(false)
        setEditPlaca(null)
        fetchPlacas()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar placa')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQrGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setQrGeneralLoading(true)
    setQrGeneralError('')

    try {
      // Gerar QR code no frontend
      const qrCodeDataUrl = await QRCode.toDataURL(qrGeneralUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrGeneralData(qrCodeDataUrl)
    } catch (err: any) {
      setQrGeneralError('Erro ao gerar QR Code: ' + err.message)
    } finally {
      setQrGeneralLoading(false)
    }
  }

  const handleGenerateQrDirectly = async (placa: Placa) => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const urlToUse = placa.url_destino || `https://qrbrasil.com.br/placa/${placa.id}`
      
      // Gerar QR code no frontend
      const qrCodeDataUrl = await QRCode.toDataURL(urlToUse, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Mostrar o QR code gerado para download
      setQrGeneralData(qrCodeDataUrl)
      setQrGeneralUrl(urlToUse)
      setShowQrGeneral(true)
      showToast('success', `QR Code gerado com sucesso para ${placa.nome_empresa}!`)
    } catch (err: any) {
      setError('Erro ao gerar QR Code: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const downloadQRCode = (dataUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  }

  // Filtrar placas baseado na busca e status
  const filteredPlacas = placas.filter(placa => {
    const matchesSearch = placa.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (placa.descricao && placa.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'with-qr' && placa.qr_code) ||
                         (filterStatus === 'without-qr' && !placa.qr_code)
    
    return matchesSearch && matchesFilter
  })

  if (loading && placas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel QR Brasil</h1>
                <p className="text-sm text-gray-600">Gerenciamento de Franquias</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border animate-pulse">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Placas List Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-pulse">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel QR Brasil</h1>
              <p className="text-sm text-gray-600">Gerenciamento de Franquias</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Placas</p>
                <p className="text-2xl font-bold text-gray-900">{placas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Atividade</p>
                <p className="text-2xl font-bold text-gray-900">Hoje</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
          >
            + Nova Placa
          </button>
          <button
            onClick={() => setShowQrGeneral(true)}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
          >
            QR Code Geral
          </button>
        </div>

        {/* Placas List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Placas Cadastradas</h2>
                <p className="text-sm text-gray-600 mt-1">Gerencie suas placas e QR codes</p>
              </div>
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Carregando...
                </div>
              )}
            </div>
            
            {/* Search and Filter Controls */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar placas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>
              </div>
              
              {/* Filter */}
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'with-qr' | 'without-qr')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                >
                  <option value="all">Todas as placas</option>
                  <option value="with-qr">Com QR Code</option>
                  <option value="without-qr">Sem QR Code</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-3 text-sm text-gray-500">
              {filteredPlacas.length === placas.length ? (
                `${placas.length} placa${placas.length !== 1 ? 's' : ''} encontrada${placas.length !== 1 ? 's' : ''}`
              ) : (
                `${filteredPlacas.length} de ${placas.length} placa${placas.length !== 1 ? 's' : ''}`
              )}
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlacas.map((placa) => (
                  <tr key={placa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{placa.nome_empresa}</div>
                        <div className="text-sm text-gray-500">Criada em: {formatDate(placa.created_at)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{placa.descricao || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {placa.url_destino ? (
                          <a href={placa.url_destino} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 truncate block max-w-xs">
                            {placa.url_destino}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {placa.qr_code ? (
                        <button
                          onClick={() => downloadQRCode(placa.qr_code || '', `qr-${placa.nome_empresa}.png`)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Baixar QR
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateQrDirectly(placa)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          Gerar QR
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditPlaca(placa)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredPlacas.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {placas.length === 0 ? 'Nenhuma placa encontrada' : 'Nenhuma placa corresponde aos filtros'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {placas.length === 0 
                    ? 'Comece criando sua primeira placa.' 
                    : 'Tente ajustar os filtros de busca.'
                  }
                </p>
                {placas.length === 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Criar Primeira Placa
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredPlacas.map((placa) => (
                  <div key={placa.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{placa.nome_empresa}</h3>
                        <p className="text-sm text-gray-500">Criada em: {formatDate(placa.created_at)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPlaca(placa)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {placa.descricao && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{placa.descricao}</p>
                      </div>
                    )}

                    {/* URL */}
                    {placa.url_destino && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">URL Destino:</p>
                        <a 
                          href={placa.url_destino} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-indigo-600 hover:text-indigo-900 break-all"
                        >
                          {placa.url_destino}
                        </a>
                      </div>
                    )}

                    {/* QR Code Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <div className="flex items-center">
                        {placa.qr_code ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            QR Gerado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            QR Pendente
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {placa.qr_code ? (
                          <button
                            onClick={() => downloadQRCode(placa.qr_code || '', `qr-${placa.nome_empresa}.png`)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Baixar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateQrDirectly(placa)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Gerar QR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty State for Desktop */}
          {filteredPlacas.length === 0 && (
            <div className="hidden lg:block p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {placas.length === 0 ? 'Nenhuma placa encontrada' : 'Nenhuma placa corresponde aos filtros'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {placas.length === 0 
                  ? 'Comece criando sua primeira placa.' 
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
              {placas.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Criar Primeira Placa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Modal - Nova Placa */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Nova Placa</h3>
            <form onSubmit={handleSubmitPlaca} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  name="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Destino</label>
                <input
                  type="url"
                  name="url_destino"
                  value={formData.url_destino}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://exemplo.com"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - QR Code Geral */}
      {showQrGeneral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">QR Code Gerado</h3>
            
            {!qrGeneralData ? (
              <form onSubmit={handleGenerateQrGeneral} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL do QR Code</label>
                  <input
                    type="url"
                    value={qrGeneralUrl}
                    onChange={(e) => setQrGeneralUrl(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://exemplo.com"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={qrGeneralLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
                  >
                    {qrGeneralLoading ? 'Gerando...' : 'Gerar QR Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQrGeneral(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mb-4">
                    <img 
                      src={qrGeneralData} 
                      alt="QR Code" 
                      className="mx-auto border border-gray-200 rounded-lg"
                      style={{ width: '200px', height: '200px' }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4 break-all">
                    URL: {qrGeneralUrl}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => downloadQRCode(qrGeneralData, 'qr-code.png')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Baixar QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQrGeneralData('')
                        setQrGeneralUrl('')
                        setShowQrGeneral(false)
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {qrGeneralError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {qrGeneralError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal - Editar Placa */}
      {showEditForm && editPlaca && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Editar Placa</h3>
            <form onSubmit={handleSubmitEditPlaca} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  name="nome_empresa"
                  value={editFormData.nome_empresa}
                  onChange={handleChangeEdit}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={editFormData.descricao}
                  onChange={handleChangeEdit}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Destino</label>
                <input
                  type="url"
                  name="url_destino"
                  value={editFormData.url_destino}
                  onChange={handleChangeEdit}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://exemplo.com"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 