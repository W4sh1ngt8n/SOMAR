function isLoggedIn() {
  return !!sessionStorage.getItem('somar_token');
}

function getUser() {
  return JSON.parse(sessionStorage.getItem('somar_user') || 'null');
}

function logout() {
  sessionStorage.removeItem('somar_token');
  sessionStorage.removeItem('somar_user');
  window.location.hash = '#/login';
}

async function doLogin(email, senha) {
  const result = await api.post('/auth/login', { email, senha });
  sessionStorage.setItem('somar_token', result.token);
  sessionStorage.setItem('somar_user', JSON.stringify(result.usuario));
  return result.usuario;
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
    return false;
  }
  return true;
}