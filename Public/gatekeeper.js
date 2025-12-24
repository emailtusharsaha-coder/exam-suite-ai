// public/gatekeeper.js

// 1. CHECK IF LOGGED IN
const token = localStorage.getItem('token');
if (!token) {
    // If no token, kick them out
    window.location.href = 'login.html';
}

// 2. CHECK ROLE & HIDE CARDS
async function checkAccess() {
    // Decode the user info saved in localStorage (we need to save role on login first!)
    const userRole = localStorage.getItem('role') || 'student'; 

    console.log("Current User Role:", userRole);

    // LOGIC: Who can see what?
    // 'student' sees everything (for now)
    // 'quant_faculty' sees ONLY Quant
    // 'english_faculty' sees ONLY English
    
    if (userRole === 'quant_faculty') {
        hideElement('card-english');
        hideElement('card-ga');
        hideElement('card-descriptive');
    } 
    else if (userRole === 'english_faculty') {
        hideElement('card-quant');
        hideElement('card-ga');
    }
    // Add more rules as needed
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// Run immediately
checkAccess();