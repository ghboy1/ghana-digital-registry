// Basic Navigation
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error('Section not found:', sectionName);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ghana Registry System loaded');
    
    // Set up form submissions
    setupFormSubmissions();
    
    // Set up search functionality
    setupSearchFunctionality();
    
    // Check admin auth status
    checkAuthStatus();
});

// Form Submission Handlers
function setupFormSubmissions() {
    // Birth form
    const birthForm = document.getElementById('birth-form');
    if (birthForm) {
        birthForm.addEventListener('submit', handleBirthSubmit);
    }
    
    // Death form
    const deathForm = document.getElementById('death-form');
    if (deathForm) {
        deathForm.addEventListener('submit', handleDeathSubmit);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

// Search Functionality
function setupSearchFunctionality() {
    // Birth search form
    const birthSearchForm = document.getElementById('birth-search-form');
    if (birthSearchForm) {
        birthSearchForm.addEventListener('submit', handleBirthSearch);
    }
    
    // Death search form
    const deathSearchForm = document.getElementById('death-search-form');
    if (deathSearchForm) {
        deathSearchForm.addEventListener('submit', handleDeathSearch);
    }
}

// Birth Form Submission with offline support
async function handleBirthSubmit(e) {
  e.preventDefault();
  console.log('Birth form submitted');
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  submitBtn.disabled = true;
  submitBtn.textContent = isOnline ? 'Submitting...' : 'Saving Offline...';
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    if (isOnline) {
      // Online: submit directly
      const response = await fetch('/api/births', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Birth registration submitted successfully!\nRegistration Number: ' + result.registrationNumber);
        e.target.reset();
        showSection('home');
      } else {
        if (result.details) {
          const errorMessage = '❌ Validation Errors:\n' + result.details.join('\n');
          alert(errorMessage);
        } else {
          alert('❌ Error: ' + result.error);
        }
      }
    } else {
      // Offline: save to local database
      const registrationId = await offlineDB.addPendingRegistration('birth', data);
      showNotification('📱 Birth registration saved offline. It will sync when back online.', 'info');
      e.target.reset();
      showSection('home');
    }
  } catch (error) {
    if (isOnline) {
      alert('❌ Network error: ' + error.message);
    } else {
      alert('❌ Failed to save offline: ' + error.message);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Death Form Submission with offline support
async function handleDeathSubmit(e) {
  e.preventDefault();
  console.log('Death form submitted');
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  submitBtn.disabled = true;
  submitBtn.textContent = isOnline ? 'Submitting...' : 'Saving Offline...';
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    if (isOnline) {
      // Online: submit directly
      const response = await fetch('/api/deaths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Death registration submitted successfully!\nRegistration Number: ' + result.registrationNumber);
        e.target.reset();
        showSection('home');
      } else {
        if (result.details) {
          const errorMessage = '❌ Validation Errors:\n' + result.details.join('\n');
          alert(errorMessage);
        } else {
          alert('❌ Error: ' + result.error);
        }
      }
    } else {
      // Offline: save to local database
      const registrationId = await offlineDB.addPendingRegistration('death', data);
      showNotification('📱 Death registration saved offline. It will sync when back online.', 'info');
      e.target.reset();
      showSection('home');
    }
  } catch (error) {
    if (isOnline) {
      alert('❌ Network error: ' + error.message);
    } else {
      alert('❌ Failed to save offline: ' + error.message);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Advanced Search Functions
function openSearchTab(tabName) {
    console.log('Opening tab:', tabName);
    
    // Hide all tab contents
    document.querySelectorAll('.search-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Activate the clicked button
    event.currentTarget.classList.add('active');
}


// Perform Search with offline support
async function performSearch(type, searchParams) {
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.innerHTML = '<p>Searching...</p>';
  
  try {
    if (isOnline) {
      // Online: search from server and cache results
      const response = await fetch(`/api/search/advanced/${type}?${searchParams}`);
      const results = await response.json();
      
      // Cache results for offline use
      await offlineDB.cacheRecords(type, results);
      
      displaySearchResults(results, type, resultsContainer);
    } else {
      // Offline: search from cached data
      showNotification('🔍 Searching cached records (offline mode)', 'info');
      const cachedResults = await offlineDB.getCachedRecords(type);
      
      if (cachedResults.length > 0) {
        // Basic client-side filtering for offline search
        const filteredResults = filterCachedResults(cachedResults, searchParams);
        displaySearchResults(filteredResults, type, resultsContainer);
        
        if (filteredResults.length === 0) {
          resultsContainer.innerHTML = '<div class="no-results">No matching records found in cached data.</div>';
        }
      } else {
        resultsContainer.innerHTML = '<div class="no-results">No cached data available. Please go online to load records.</div>';
      }
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = `<p class="error">Search failed: ${error.message}</p>`;
  }
}

// Client-side filtering for offline search
function filterCachedResults(results, searchParams) {
  const params = new URLSearchParams(searchParams);
  let filtered = [...results];
  
  // Filter by first name
  const firstName = params.get('firstName');
  if (firstName) {
    filtered = filtered.filter(record => 
      record.child_first_name?.toLowerCase().includes(firstName.toLowerCase()) ||
      record.deceased_first_name?.toLowerCase().includes(firstName.toLowerCase())
    );
  }
  
  // Filter by last name
  const lastName = params.get('lastName');
  if (lastName) {
    filtered = filtered.filter(record => 
      record.child_last_name?.toLowerCase().includes(lastName.toLowerCase()) ||
      record.deceased_last_name?.toLowerCase().includes(lastName.toLowerCase())
    );
  }
  
  // Filter by registration number
  const regNumber = params.get('registrationNumber');
  if (regNumber) {
    filtered = filtered.filter(record => 
      record.registration_number?.toLowerCase().includes(regNumber.toLowerCase())
    );
  }
  
  return filtered;
}
// Offline functionality
let isOnline = navigator.onLine;
const offlineDB = new OfflineDB();

// Initialize offline database
offlineDB.init().then(() => {
  console.log('Offline database initialized');
}).catch(error => {
  console.error('Failed to initialize offline database:', error);
});

// Online/Offline detection
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

function handleOnline() {
  console.log('App is online');
  isOnline = true;
  showNotification('✅ Back online - syncing data...', 'success');
  
  // Sync pending registrations
  syncPendingRegistrations();
  
  // Update UI
  updateOnlineStatus();
}

function handleOffline() {
  console.log('App is offline');
  isOnline = false;
  showNotification('📱 Working offline - changes will sync when back online', 'info');
  
  // Update UI
  updateOnlineStatus();
}

function updateOnlineStatus() {
  const statusElement = document.getElementById('online-status') || createOnlineStatusElement();
  statusElement.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
  statusElement.style.background = isOnline ? '#006B3F' : '#CE1126';
}

function createOnlineStatusElement() {
  const statusElement = document.createElement('div');
  statusElement.id = 'online-status';
  statusElement.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 5px 10px;
    background: #006B3F;
    color: white;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    z-index: 10000;
  `;
  document.body.appendChild(statusElement);
  return statusElement;
}

// Sync pending registrations when coming online
async function syncPendingRegistrations() {
  try {
    const pendingRegistrations = await offlineDB.getPendingRegistrations();
    
    for (const registration of pendingRegistrations) {
      try {
        let response;
        
        if (registration.type === 'birth') {
          response = await fetch('/api/births', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registration.data)
          });
        } else if (registration.type === 'death') {
          response = await fetch('/api/deaths', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registration.data)
          });
        }
        
        if (response && response.ok) {
          const result = await response.json();
          await offlineDB.removePendingRegistration(registration.id);
          console.log('Successfully synced registration:', registration.id);
          
          showNotification(`✅ Synced ${registration.type} registration: ${result.registrationNumber}`, 'success');
        }
      } catch (error) {
        console.error('Failed to sync registration:', registration.id, error);
      }
    }
  } catch (error) {
    console.error('Error syncing pending registrations:', error);
  }
}


// Birth Search
async function handleBirthSearch(e) {
    e.preventDefault();
    console.log('Birth search submitted');
    
    const formData = new FormData(e.target);
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of formData) {
        if (value) {
            searchParams.append(key, value);
        }
    }
    
    await performSearch('births', searchParams);
}

// Death Search
async function handleDeathSearch(e) {
    e.preventDefault();
    console.log('Death search submitted');
    
    const formData = new FormData(e.target);
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of formData) {
        if (value) {
            searchParams.append(key, value);
        }
    }
    
    await performSearch('deaths', searchParams);
}

// Perform Search
async function performSearch(type, searchParams) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    try {
        const response = await fetch(`/api/search/advanced/${type}?${searchParams}`);
        const results = await response.json();
        
        displaySearchResults(results, type, resultsContainer);
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `<p class="error">Search failed: ${error.message}</p>`;
    }
}

// Display Search Results
function displaySearchResults(results, type, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No records found matching your search criteria.</div>';
        return;
    }
    
    let html = '';
    
    results.forEach(record => {
        if (type === 'births') {
            html += `
                <div class="result-item">
                    <div class="result-header">
                        <span class="result-type">🎉 BIRTH</span>
                        <strong>${record.registration_number}</strong>
                    </div>
                    <p><strong>Child:</strong> ${record.child_first_name} ${record.child_last_name}</p>
                    <p><strong>Date of Birth:</strong> ${record.date_of_birth}</p>
                    <p><strong>Place:</strong> ${record.place_of_birth}</p>
                    <p><strong>Mother:</strong> ${record.mother_first_name} ${record.mother_last_name}</p>
                    <div class="result-actions">
                        <button onclick="generateBirthCertificate('${record.registration_number}')" class="btn-download">
                            📄 Download Certificate
                        </button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="result-item">
                    <div class="result-header">
                        <span class="result-type">⚰️ DEATH</span>
                        <strong>${record.registration_number}</strong>
                    </div>
                    <p><strong>Deceased:</strong> ${record.deceased_first_name} ${record.deceased_last_name}</p>
                    <p><strong>Date of Death:</strong> ${record.date_of_death}</p>
                    <p><strong>Place:</strong> ${record.place_of_death}</p>
                    <p><strong>Age:</strong> ${record.age_at_death || 'N/A'} years</p>
                    <p><strong>Cause:</strong> ${record.cause_of_death || 'Not specified'}</p>
                    <div class="result-actions">
                        <button onclick="generateDeathCertificate('${record.registration_number}')" class="btn-download">
                            📄 Download Certificate
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// Clear Search Forms
function clearBirthSearch() {
    document.getElementById('birth-search-form').reset();
    document.getElementById('results-container').innerHTML = '';
}

function clearDeathSearch() {
    document.getElementById('death-search-form').reset();
    document.getElementById('results-container').innerHTML = '';
}

// Certificate Generation
async function generateBirthCertificate(registrationNumber) {
    try {
        showNotification('🔄 Generating birth certificate...', 'info');
        window.open(`/certificates/birth/${registrationNumber}`, '_blank');
    } catch (error) {
        showNotification('❌ Failed to generate certificate: ' + error.message, 'error');
    }
}

async function generateDeathCertificate(registrationNumber) {
    try {
        showNotification('🔄 Generating death certificate...', 'info');
        window.open(`/certificates/death/${registrationNumber}`, '_blank');
    } catch (error) {
        showNotification('❌ Failed to generate certificate: ' + error.message, 'error');
    }
}

// Admin Functions
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('✅ Login successful!', 'success');
            checkAuthStatus();
        } else {
            showNotification('❌ ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('❌ Network error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/status');
        const result = await response.json();
        
        if (result.loggedIn) {
            document.getElementById('login-form-container').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            loadDashboardStats();
        } else {
            document.getElementById('login-form-container').style.display = 'block';
            document.getElementById('admin-content').style.display = 'none';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('total-births').textContent = stats.totalBirths;
        document.getElementById('total-deaths').textContent = stats.totalDeaths;
        document.getElementById('today-registrations').textContent = stats.todayTotal;
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadAllRecords(type) {
    try {
        const response = await fetch(`/api/records/${type}`);
        const records = await response.json();
        displayRecordsTable(records, type);
    } catch (error) {
        showNotification('❌ Failed to load records: ' + error.message, 'error');
    }
}

function displayRecordsTable(records, type) {
    const container = document.getElementById('records-table');
    
    if (records.length === 0) {
        container.innerHTML = '<p>No records found.</p>';
        return;
    }
    
    let html = `<h3>${type === 'births' ? 'Birth' : 'Death'} Records (${records.length})</h3>`;
    html += '<table>';
    
    if (type === 'births') {
        html += `
            <thead>
                <tr>
                    <th>Reg No.</th>
                    <th>Child Name</th>
                    <th>Date of Birth</th>
                    <th>Place</th>
                    <th>Mother</th>
                    <th>Registration Date</th>
                    <th>Certificate</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        records.forEach(record => {
            html += `
                <tr>
                    <td>${record.registration_number}</td>
                    <td>${record.child_first_name} ${record.child_last_name}</td>
                    <td>${record.date_of_birth}</td>
                    <td>${record.place_of_birth}</td>
                    <td>${record.mother_first_name} ${record.mother_last_name}</td>
                    <td>${record.registration_date}</td>
                    <td>
                        <button onclick="generateBirthCertificate('${record.registration_number}')" class="btn-small">
                            📄 Download
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += `
            <thead>
                <tr>
                    <th>Reg No.</th>
                    <th>Deceased Name</th>
                    <th>Date of Death</th>
                    <th>Place</th>
                    <th>Age</th>
                    <th>Cause</th>
                    <th>Registration Date</th>
                    <th>Certificate</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        records.forEach(record => {
            html += `
                <tr>
                    <td>${record.registration_number}</td>
                    <td>${record.deceased_first_name} ${record.deceased_last_name}</td>
                    <td>${record.date_of_death}</td>
                    <td>${record.place_of_death}</td>
                    <td>${record.age_at_death || 'N/A'}</td>
                    <td>${record.cause_of_death || 'N/A'}</td>
                    <td>${record.registration_date}</td>
                    <td>
                        <button onclick="generateDeathCertificate('${record.registration_number}')" class="btn-small">
                            📄 Download
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function exportData() {
    showNotification('📊 Export feature coming soon!', 'success');
}

// Notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#CE1126' : type === 'success' ? '#006B3F' : '#FCD116'};
        color: ${type === 'info' ? '#000' : '#fff'};
        border-radius: 5px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Make functions globally available
window.showSection = showSection;
window.openSearchTab = openSearchTab;
window.clearBirthSearch = clearBirthSearch;
window.clearDeathSearch = clearDeathSearch;
window.generateBirthCertificate = generateBirthCertificate;
window.generateDeathCertificate = generateDeathCertificate;
window.loadAllRecords = loadAllRecords;
window.exportData = exportData;


// Show pending offline registrations
async function showPendingRegistrations() {
  try {
    const pending = await offlineDB.getPendingRegistrations();
    
    if (pending.length === 0) {
      showNotification('No pending offline registrations', 'info');
      return;
    }
    
    let message = `📱 You have ${pending.length} pending offline registration(s):\n\n`;
    
    pending.forEach((reg, index) => {
      const data = reg.data;
      if (reg.type === 'birth') {
        message += `${index + 1}. BIRTH: ${data.child_first_name} ${data.child_last_name}\n`;
      } else {
        message += `${index + 1}. DEATH: ${data.deceased_first_name} ${data.deceased_last_name}\n`;
      }
    });
    
    message += '\nThese will sync automatically when back online.';
    alert(message);
  } catch (error) {
    showNotification('❌ Failed to load pending registrations: ' + error.message, 'error');
  }
}

// Add pending registrations button to home section
function addOfflineFeatures() {
  const homeSection = document.getElementById('home-section');
  if (homeSection) {
    const pendingButton = document.createElement('button');
    pendingButton.className = 'btn-secondary';
    pendingButton.innerHTML = '📱 View Pending Offline Registrations';
    pendingButton.onclick = showPendingRegistrations;
    pendingButton.style.marginTop = '1rem';
    
    const quickActions = homeSection.querySelector('.quick-actions');
    if (quickActions) {
      quickActions.appendChild(pendingButton);
    }
  }
}

// Call this in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  
  // Add offline features
  addOfflineFeatures();
  updateOnlineStatus();
});

// Enhanced Real-time Validation
function setupEnhancedValidation() {
    // Ghana Card validation
    document.querySelectorAll('input[name*="national_id"]').forEach(input => {
        input.addEventListener('blur', function() {
            validateGhanaCard(this);
        });
    });

    // Phone validation
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('blur', function() {
            validatePhone(this);
        });
    });

    // Date validation
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('change', function() {
            validateDate(this);
        });
    });

    // Required field validation
    document.querySelectorAll('[required]').forEach(input => {
        input.addEventListener('blur', function() {
            validateRequired(this);
        });
    });
}

// Enhanced validation functions
function validateGhanaCard(input) {
    const value = input.value.trim();
    if (!value) {
        clearValidation(input);
        return true;
    }
    
    const ghanaCardRegex = /^GHA-[A-Z]{3}-\d{4}-[A-Z]$/;
    const isValid = ghanaCardRegex.test(value);
    
    showValidation(input, isValid, 'Format: GHA-XXX-0000-X (e.g., GHA-ABC-1234-D)');
    return isValid;
}

function validatePhone(input) {
    const value = input.value.trim();
    if (!value) {
        clearValidation(input);
        return true;
    }
    
    const phoneRegex = /^(?:\+233|0)[235]\d{8}$/;
    const isValid = phoneRegex.test(value.replace(/\s/g, ''));
    
    showValidation(input, isValid, 'Format: 0201234567 or +233201234567');
    return isValid;
}

function validateDate(input) {
    const value = input.value;
    if (!value) {
        clearValidation(input);
        return true;
    }
    
    const inputDate = new Date(value);
    const today = new Date();
    const isValid = inputDate <= today;
    
    showValidation(input, isValid, 'Date cannot be in the future');
    return isValid;
}

function validateRequired(input) {
    const value = input.value.trim();
    const isValid = value.length > 0;
    
    showValidation(input, isValid, 'This field is required');
    return isValid;
}

function showValidation(input, isValid, message) {
    const formGroup = input.closest('.form-group');
    const existingMessage = formGroup.querySelector('.validation-message');
    
    // Remove existing classes and messages
    input.classList.remove('error', 'success');
    if (existingMessage) existingMessage.remove();
    
    if (input.value.trim() === '' && !input.hasAttribute('required')) {
        return; // Don't validate empty optional fields
    }
    
    if (isValid) {
        input.classList.add('success');
    } else {
        input.classList.add('error');
        const messageElement = document.createElement('div');
        messageElement.className = 'validation-message';
        messageElement.style.cssText = `
            color: var(--secondary-color);
            font-size: 0.8rem;
            margin-top: 0.25rem;
            font-weight: 500;
        `;
        messageElement.textContent = message;
        formGroup.appendChild(messageElement);
    }
}

function clearValidation(input) {
    input.classList.remove('error', 'success');
    const formGroup = input.closest('.form-group');
    const existingMessage = formGroup.querySelector('.validation-message');
    if (existingMessage) existingMessage.remove();
}