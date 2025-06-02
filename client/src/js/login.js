// DOM handler
const loginForm = document.getElementById('loginForm');

// Arrow function & async/await
const handleLogin = async (e) => {
  e.preventDefault();

  // Destructuring input values
  const { username, password } = Object.fromEntries(new FormData(loginForm));

  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.status === 'success') {
      window.location.href = data.redirectUrl;
    } else {
      alert(data.message);
      window.location.href = data.redirectUrl;
    }

  } catch (err) {
    console.error('Login failed', err);
    alert('Something went wrong. Please try again later.');
  }
};

loginForm.addEventListener('submit', handleLogin);
