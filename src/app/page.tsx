'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { criarFranquia } from '@/services/auth'

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

function maskCEP(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    email: '',
    senha: '',
    telefone: ''
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
      const data = await criarFranquia(formData)
      
      if (data.success) {
        setSuccess(true)
        setMessage('Cadastro realizado com sucesso! Redirecionando...')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1200)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar franquia')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newValue = value
    if (name === 'cnpj') newValue = maskCNPJ(value)
    if (name === 'telefone') newValue = maskWhatsApp(value)
    if (name === 'cep') newValue = maskCEP(value)
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50 resize-none"
                placeholder="Endereço Completo"
                value={formData.endereco}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  id="cidade"
                  name="cidade"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  id="estado"
                  name="estado"
                  type="text"
                  required
                  maxLength={2}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                  placeholder="SP"
                  value={formData.estado}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                id="cep"
                name="cep"
                type="text"
                required
                maxLength={9}
                autoComplete="off"
                inputMode="numeric"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="00000-000"
                value={formData.cep}
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                id="telefone"
                name="telefone"
                type="text"
                required
                maxLength={15}
                autoComplete="off"
                inputMode="numeric"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base bg-gray-50"
                placeholder="(99) 99999-9999"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
          </div>

          {message && (
            <div className="rounded-md bg-green-50 p-3 text-center">
              <div className="text-base text-green-700 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
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
              disabled={loading || success}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 shadow-md transition"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cadastrando...
                </div>
              ) : success ? (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Redirecionando...
                </div>
              ) : (
                'Cadastrar Franquia'
              )}
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
