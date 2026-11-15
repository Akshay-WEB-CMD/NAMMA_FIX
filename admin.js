document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const loginBtn = document.getElementById('loginBtn');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const tableBody = document.getElementById('tableBody');

  // Check if token exists
  if (sessionStorage.getItem('adminToken')) {
    showDashboard();
  }

  loginBtn.addEventListener('click', async () => {
    loginError.style.display = 'none';
    const password = adminPassword.value;
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        sessionStorage.setItem('adminToken', data.token);
        showDashboard();
      } else {
        loginError.innerText = data.error || 'Login failed';
        loginError.style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      loginError.innerText = 'Server error. Is it running?';
      loginError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminToken');
    dashboardSection.style.display = 'none';
    loginSection.style.display = 'flex';
    adminPassword.value = '';
  });

  function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    fetchRequests();
  }

  async function fetchRequests() {
    const token = sessionStorage.getItem('adminToken');
    
    try {
      const response = await fetch('/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        logoutBtn.click();
        return;
      }
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      renderTable(data);
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = '<tr><td colspan="7">Error loading data. Server might be down.</td></tr>';
    }
  }

  function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7">No customer requests found.</td></tr>';
      return;
    }

    data.forEach(req => {
      const isCompleted = req.status === 'Completed';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${req.id}</td>
        <td><strong>${req.type}</strong></td>
        <td>${req.customer_name}</td>
        <td><a href="tel:${req.phone}">${req.phone}</a></td>
        <td><small>${req.details}</small></td>
        <td>
          <span class="status-badge ${isCompleted ? 'status-completed' : 'status-pending'}">
            ${req.status}
          </span>
        </td>
        <td>
          <button class="action-btn" onclick="markCompleted(${req.id})" ${isCompleted ? 'disabled' : ''}>
            ${isCompleted ? 'Done' : 'Mark Completed'}
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }
});

// Global function for the inline onclick handler
window.markCompleted = async function(id) {
  const token = sessionStorage.getItem('adminToken');
  if (!token) {
    window.location.reload();
    return;
  }
  
  try {
    const response = await fetch('/api/complete', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: id })
    });
    
    if (response.ok) {
      // Refresh by reloading the page (or you could just fetch again)
      window.location.reload();
    } else if (response.status === 401) {
      sessionStorage.removeItem('adminToken');
      window.location.reload();
    }
  } catch (err) {
    console.error('Failed to update status', err);
    alert('Failed to connect to server.');
  }
};
