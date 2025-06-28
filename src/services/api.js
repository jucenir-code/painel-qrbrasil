export const API_BASE_URL = '/api/qrbrasil';

// Função para obter o token do localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Função para fazer requisições autenticadas
export const authenticatedRequest = async (url, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
  }

  return response.json();
};

// Função para fazer logout
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
}; 