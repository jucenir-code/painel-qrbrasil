import { API_BASE_URL } from './api.js';

// Criar nova placa
export const criarPlaca = async (dadosPlaca) => {
  const token = localStorage.getItem('token');
  console.log('Token para criar placa:', token);
  console.log('Dados da placa:', dadosPlaca);
  
  try {
    const response = await fetch(`${API_BASE_URL}/placas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome_empresa: dadosPlaca.nome_empresa,
        descricao: dadosPlaca.descricao,
        url_destino: dadosPlaca.url_destino,
      }),
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', response.headers);

    const data = await response.json();
    console.log('Resposta criar placa:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
};

// Listar placas
export const listarPlacas = async () => {
  const token = localStorage.getItem('token');
  console.log('Token para listar placas:', token);
  
  try {
    const response = await fetch(`${API_BASE_URL}/placas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', response.headers);

    const data = await response.json();
    console.log('Resposta listar placas:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
};

// Obter QR code de uma placa
export const obterQRCode = async (placaId, url) => {
  const token = localStorage.getItem('token');
  
  try {
    // Usar a rota qrcode/geral que existe na API
    const response = await fetch(`${API_BASE_URL}/qrcode/geral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        url: url,
        placa_id: placaId // Incluir o ID da placa para referência
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
};

// Atualizar placa
export const atualizarPlaca = async (placaId, dadosPlaca) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/placas/${placaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome_empresa: dadosPlaca.nome_empresa,
        descricao: dadosPlaca.descricao,
        url_destino: dadosPlaca.url_destino,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
};

// Gerar QR code geral
export const gerarQRCodeGeral = async (url) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/qrcode/geral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
}; 