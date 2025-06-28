'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    email: '',
    senha: '',
    whatsapp: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage('Cadastro realizado com sucesso! Redirecionando...')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1200)
      } else {
        setError(data.error || 'Erro ao cadastrar franquia')
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-2 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-8 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Painel QR Brasil
          </h2>
          <p className="mt-2 text-center text-base text-gray-600">
            Cadastro de Franquia
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Franquia
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                autoComplete="off"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="Nome da Franquia"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                id="cnpj"
                name="cnpj"
                type="text"
                required
                maxLength={18}
                autoComplete="off"
                inputMode="numeric"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <textarea
                id="endereco"
                name="endereco"
                required
                rows={2}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50 resize-none"
                placeholder="Endereço Completo"
                value={formData.endereco}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="off"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                autoComplete="new-password"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="text"
                required
                maxLength={15}
                autoComplete="off"
                inputMode="numeric"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="(99) 99999-9999"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>
          </div>

          {message && (
            <div className="rounded-md bg-green-50 p-3 text-center">
              <div className="text-base text-green-700">{message}</div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-center">
              <div className="text-base text-red-700">{error}</div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 shadow-md transition"
              style={{ position: 'relative' }}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Franquia'}
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 text-base"
            >
              Já tem uma conta? <span className="underline">Faça login</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
