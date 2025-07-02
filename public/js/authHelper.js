const API_BASE_URL = 'http://localhost:3500';

/*
    This file handles basic server requests multiple files will make
    1. Handle the refreshing of tokens
    2. Handling the responce from the server.
    3. Login redirect if someone is wrong 
*/

//----------------------------------------------------------
// Refresh the access token
async function refreshToken() {
  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

//----------------------------------------------------------
// Check validity of token. If needed, refreshes it.
// I do not even knwow if this fucking works and I'm getting angry
async function checkToken() {
  let token = localStorage.getItem('accessToken');

  if (!token) {
    redirectToLogin();
    throw new Error('No access token');
  }

  // This is an issue line, wtf is /tokenCheck???
  const testResponse = await fetch(`${API_BASE_URL}/tokenCheck`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (testResponse.status === 401 || testResponse.status === 403) {
    try {
      token = await refreshToken(); // Refresh it and return the new one
      return token;
    } catch (err) {
      localStorage.removeItem('accessToken');
      redirectToLogin();
      throw err;
    }
  }

  return token; // Valid token
}


function redirectToLogin() {
  window.location.href = '/index.html';
}

//----------------------------------------------------------
// Handles server response, Retries refreshing token, else go to login
async function fetchWithAuth(url, options = {}) {
  let token = await checkToken();

  const makeRequest = async (token) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401 || response.status === 403) {
    try {
      const newToken = await refreshToken();
      response = await makeRequest(newToken);
    } catch (err) {
      localStorage.removeItem('accessToken');
      redirectToLogin();
      throw err;
    }
  }

  if (!response.ok) {
    redirectToLogin();
    throw new Error('Request failed');
  }

  return response;
}




let cachedUsername = null;

async function getCurrentUsername() {
  if (cachedUsername) return cachedUsername;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/getInfo`, {
      method: 'GET'
    });

    const text = await response.text();

    if (!text) throw new Error("Empty user info response");

    const parts = text.trim().split(/\s+/);
    cachedUsername = parts[0].replace(/:$/, ''); // "Alice:" => "Alice"

    return cachedUsername;
  } catch (err) {
    console.error("Failed to get username:", err);
    redirectToLogin();
    throw err;
  }
}






// Expose globally
// Make helpers globally available
window.fetchWithAuth = fetchWithAuth;
window.refreshToken = refreshToken;
window.checkToken = checkToken;
window.getCurrentUsername = getCurrentUsername;