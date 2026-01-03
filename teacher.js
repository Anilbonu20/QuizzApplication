let currentQuiz = {
    name: '',
    questions: []
};

// Load saved quizzes on page load
window.addEventListener('DOMContentLoaded', () => {
    loadSavedQuizzes();
    updateQuestionsList();
});

// Add question to current quiz
function addQuestion() {
    const quizName = document.getElementById('quizName').value.trim();
    const question = document.getElementById('question').value.trim();
    const op1 = document.getElementById('op1').value.trim();
    const op2 = document.getElementById('op2').value.trim();
    const op3 = document.getElementById('op3').value.trim();
    const op4 = document.getElementById('op4').value.trim();
    const correct = document.getElementById('correct').value;
    const timeLimit = parseInt(document.getElementById('timeLimit').value) || 30;

    // Validation
    if (!quizName) {
        alert('Please enter a quiz name');
        return;
    }

    if (!question || !op1 || !op2 || !op3 || !op4 || correct === '') {
        alert('Please fill in all fields');
        return;
    }

    // Set quiz name (only needed for first question)
    if (currentQuiz.questions.length === 0) {
        currentQuiz.name = quizName;
        document.getElementById('quizName').disabled = true;
    }

    // Add question
    const questionObj = {
        q: question,
        options: [op1, op2, op3, op4],
        correct: parseInt(correct),
        timeLimit: timeLimit
    };

    currentQuiz.questions.push(questionObj);

    // Clear form
    document.getElementById('question').value = '';
    document.getElementById('op1').value = '';
    document.getElementById('op2').value = '';
    document.getElementById('op3').value = '';
    document.getElementById('op4').value = '';
    document.getElementById('correct').value = '';
    document.getElementById('timeLimit').value = '30';

    updateQuestionsList();
    showNotification('Question added successfully!');
}

// Update questions list display
function updateQuestionsList() {
    const listDiv = document.getElementById('questionsList');
    const countSpan = document.getElementById('questionCount');
    const saveBtn = document.getElementById('saveBtn');

    countSpan.textContent = currentQuiz.questions.length;
    
    if (currentQuiz.questions.length === 0) {
        listDiv.innerHTML = '<p class="empty-state">No questions added yet. Add your first question above!</p>';
        saveBtn.disabled = true;
        return;
    }

    saveBtn.disabled = false;

    listDiv.innerHTML = currentQuiz.questions.map((q, index) => `
        <div class="question-item">
            <div class="question-item-header">
                <strong>Question ${index + 1}</strong>
                <button class="btn-remove" onclick="removeQuestion(${index})">✕</button>
            </div>
            <p>${q.q}</p>
            <div class="options-preview">
                ${q.options.map((opt, i) => `
                    <span class="option-tag ${i === q.correct ? 'correct' : ''}">
                        ${opt} ${i === q.correct ? '✓' : ''}
                    </span>
                `).join('')}
            </div>
            <small>Time Limit: ${q.timeLimit} seconds</small>
        </div>
    `).join('');
}

// Remove question
function removeQuestion(index) {
    if (confirm('Are you sure you want to remove this question?')) {
        currentQuiz.questions.splice(index, 1);
        
        // If no questions left, enable quiz name field
        if (currentQuiz.questions.length === 0) {
            currentQuiz.name = '';
            document.getElementById('quizName').disabled = false;
        }
        
        updateQuestionsList();
    }
}

// Save quiz to localStorage
function saveQuiz() {
    if (currentQuiz.questions.length === 0) {
        alert('Please add at least one question');
        return;
    }

    if (!currentQuiz.name) {
        alert('Please enter a quiz name');
        return;
    }

    // Get all saved quizzes
    let savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    
    // Check if quiz name already exists
    const existingIndex = savedQuizzes.findIndex(q => q.name === currentQuiz.name);
    
    if (existingIndex !== -1) {
        if (confirm(`A quiz with name "${currentQuiz.name}" already exists. Do you want to replace it?`)) {
            savedQuizzes[existingIndex] = { ...currentQuiz, id: savedQuizzes[existingIndex].id || Date.now() };
        } else {
            return;
        }
    } else {
        // Add new quiz with unique ID
        savedQuizzes.push({ ...currentQuiz, id: Date.now() });
    }

    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
    
    // Reset current quiz
    currentQuiz = { name: '', questions: [] };
    document.getElementById('quizName').value = '';
    document.getElementById('quizName').disabled = false;
    updateQuestionsList();
    loadSavedQuizzes();
    
    showNotification('Quiz saved successfully!');
}

// Load and display saved quizzes
function loadSavedQuizzes() {
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    const quizzesListDiv = document.getElementById('quizzesList');

    if (savedQuizzes.length === 0) {
        quizzesListDiv.innerHTML = '<p class="empty-state">No saved quizzes yet. Create your first quiz above!</p>';
        return;
    }

    quizzesListDiv.innerHTML = savedQuizzes.map(quiz => `
        <div class="quiz-item">
            <div class="quiz-item-info">
                <h3>${quiz.name}</h3>
                <p>${quiz.questions.length} question${quiz.questions.length !== 1 ? 's' : ''}</p>
            </div>
            <div class="quiz-item-actions">
                <button class="btn btn-outline btn-sm" onclick="deleteQuiz('${quiz.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete quiz
function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        let savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
        savedQuizzes = savedQuizzes.filter(q => q.id.toString() !== quizId.toString());
        localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
        loadSavedQuizzes();
        showNotification('Quiz deleted successfully!');
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

