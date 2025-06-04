/*
    just to store things that may not be needed or perhaps implimented later


    // Force reload. Add security like in home so that it verify the user is logged in
    window.addEventListener('pageshow', async (event) => {
      if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          window.location.href = 'index.html';
          return;
        }

        // Verify token validity by making a quick authenticated request
        const response = await fetch(`${API_BASE_URL}/assets`, {
          method: 'HEAD', 
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
          window.location.href = 'index.html';
        } else {
          window.location.reload();
        }
      }
    });










*/