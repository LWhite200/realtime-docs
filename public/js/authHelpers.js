const API_BASE_URL = 'http://localhost:3500';


//----------------------------------------------------------
// Update the access token of the logged in user
async function refreshToken() {
  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) throw new Error('Failed to refresh token');

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}



//------------------------------------------------------------------
// Return the name of the currently logged in user via their JWT
async function fetchUserLoggedInData() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    window.location.href = '/index.html'; // redirect if no token
    return;
  }

  let response = await fetch(`${API_BASE_URL}/getInfo`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 403) {
    try {
      const newToken = await refreshToken();
      response = await fetch(`${API_BASE_URL}/getInfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });
    } catch {
      localStorage.removeItem('accessToken');
      window.location.href = '/index.html';
      return;
    }
  }

  if (!response.ok) {
    window.location.href = '/index.html';
    return;
  }

  return response.text();
}
