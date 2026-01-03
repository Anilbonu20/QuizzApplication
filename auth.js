// Simple password authentication
// Default password: "teacher123" (can be changed)
const TEACHER_PASSWORD = "teacher123";

// Check if user is authenticated in this session
function isAuthenticated() {
    return sessionStorage.getItem('teacherAuthenticated') === 'true';
}

// Authenticate teacher
function authenticateTeacher() {
    const password = prompt("Enter teacher password:");
    
    if (password === TEACHER_PASSWORD) {
        sessionStorage.setItem('teacherAuthenticated', 'true');
        return true;
    } else if (password !== null) { // User clicked OK but wrong password
        alert("Incorrect password. Access denied.");
        return false;
    }
    // User clicked Cancel
    return false;
}

// Check authentication and redirect if needed
function checkTeacherAuth() {
    if (!isAuthenticated()) {
        alert("Authentication required to access Teacher Mode.");
        window.location.href = 'index.html';
    }
}

// Logout function
function logoutTeacher() {
    sessionStorage.removeItem('teacherAuthenticated');
    window.location.href = 'index.html';
}

