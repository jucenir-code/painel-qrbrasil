import { API_BASE_URL } from './api.js';

export const loginFranquia = async (email, senha) => {
  try {
    console.log('Tentando fazer login com:', { email, senha });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    console.log('Status da resposta login:', response.status);
    const data = await response.json();
    console.log('Resposta do login:', data);
    
    if (data.success) {
      // Salvar token no localStorage
      console.log('Token recebido:', data.token);
      localStorage.setItem('token', data.token);
      
      // Verificar se foi salvo
      const savedToken = localStorage.getItem('token');
      console.log('Token salvo no localStorage:', savedToken);
      
      return data;
    } else {
      throw new Error(data.message || 'Erro no login');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// Criar nova franquia
export const criarFranquia = async (dadosFranquia) => {
  try {
    const response = await fetch(`${API_BASE_URL}/franquias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: dadosFranquia.nome,
        email: dadosFranquia.email,
        senha: dadosFranquia.senha,
        cnpj: dadosFranquia.cnpj,
        telefone: dadosFranquia.telefone,
        endereco: dadosFranquia.endereco,
        cidade: dadosFranquia.cidade,
        estado: dadosFranquia.estado,
        cep: dadosFranquia.cep,
      }),
    });

    console.log('Status da resposta cadastro:', response.status);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro no cadastro:', error);
    throw error;
  }
};

// Listar franquias
export const listarFranquias = async () => {
  const token = localStorage.getItem('token');
  console.log('Token para listar franquias:', token);
  
  try {
    const response = await fetch(`${API_BASE_URL}/franquias`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Status da resposta listar franquias:', response.status);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao listar franquias:', error);
    throw error;
  }
};

// Obter franquia específica
export const obterFranquia = async (id) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_BASE_URL}/franquias/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao obter franquia:', error);
    throw error;
  }
}; 