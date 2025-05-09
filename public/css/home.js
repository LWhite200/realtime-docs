// public/home.js (Client-side)
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Make a GET request to the /home route to get user data
        const response = await fetch('/home', { method: 'GET', credentials: 'include' });

        if (response.ok) {
            const data = await response.json();
            // Display the user name and roles on the page
            const userDataDiv = document.getElementById('userData');
            userDataDiv.innerHTML = `<p>Welcome, ${data.username}!</p><p>Your roles: ${data.roles.join(', ')}</p>`;
        } else {
            console.log('No user data found.');
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
    }
});
