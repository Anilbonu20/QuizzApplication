let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 0;

// Load available quizzes on page load
window.addEventListener('DOMContentLoaded', () => {
    loadAvailableQuizzes();
});

// Load and display available quizzes
function loadAvailableQuizzes() {
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    const availableQuizzesDiv = document.getElementById('availableQuizzes');

    if (savedQuizzes.length === 0) {
        availableQuizzesDiv.innerHTML = '<p class="empty-state">No quizzes available. Ask your teacher to create one!</p>';
        return;
    }

    availableQuizzesDiv.innerHTML = savedQuizzes.map(quiz => `
        <div class="quiz-selection-item">
            <div class="quiz-selection-info">
                <h3>${quiz.name}</h3>
                <p>${quiz.questions.length} question${quiz.questions.length !== 1 ? 's' : ''}</p>
                <p class="quiz-meta">Total time: ~${calculateTotalTime(quiz)} seconds</p>
            </div>
            <button class="btn btn-primary" onclick="startQuiz(${quiz.id})">Start Quiz</button>
        </div>
    `).join('');
}

// Calculate total time for quiz
function calculateTotalTime(quiz) {
    return quiz.questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0);
}

// Start quiz
function startQuiz(quizId) {
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    currentQuiz = savedQuizzes.find(q => q.id === quizId);

    if (!currentQuiz) {
        alert('Quiz not found');
        return;
    }

    // Initialize user answers
    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    currentQuestionIndex = 0;

    // Hide quiz selection, show quiz container
    document.getElementById('quizSelection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('resultsContainer').style.display = 'none';

    // Display first question
    displayQuestion();
}

// Display current question
function displayQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    const totalQuestions = currentQuiz.questions.length;

    // Update header
    document.getElementById('quizTitle').textContent = currentQuiz.name;
    document.getElementById('questionNumber').textContent = `Question ${questionNumber} of ${totalQuestions}`;

    // Update question text
    document.getElementById('questionText').textContent = question.q;

    // Update options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((option, index) => {
        const isChecked = userAnswers[currentQuestionIndex] === index ? 'checked' : '';
        return `
            <label class="option-label">
                <input type="radio" name="answer" value="${index}" ${isChecked} onchange="selectAnswer(${index})">
                <span class="option-text">${option}</span>
            </label>
        `;
    }).join('');

    // Update navigation buttons
    document.getElementById('prevBtn').style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
    document.getElementById('nextBtn').style.display = currentQuestionIndex === totalQuestions - 1 ? 'none' : 'inline-block';
    document.getElementById('submitBtn').style.display = currentQuestionIndex === totalQuestions - 1 ? 'inline-block' : 'none';

    // Start timer
    startTimer(question.timeLimit || 30);
}

// Select answer
function selectAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;
}

// Start timer for current question
function startTimer(seconds) {
    // Clear existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timeRemaining = seconds;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            // Auto-advance to next question
            if (currentQuestionIndex < currentQuiz.questions.length - 1) {
                nextQuestion();
            } else {
                submitQuiz();
            }
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeRemaining;
    
    // Change color based on time remaining
    timerElement.className = 'timer';
    if (timeRemaining <= 10) {
        timerElement.classList.add('timer-warning');
    }
    if (timeRemaining <= 5) {
        timerElement.classList.add('timer-danger');
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Navigate to next question
function nextQuestion() {
    // Check if all questions are answered before allowing submit
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

// Submit quiz
function submitQuiz() {
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Calculate score
    let score = 0;
    const results = currentQuiz.questions.map((question, index) => {
        const isCorrect = userAnswers[index] === question.correct;
        if (isCorrect) score++;
        return {
            question: question.q,
            userAnswer: userAnswers[index] !== null ? question.options[userAnswers[index]] : 'Not answered',
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect,
            options: question.options
        };
    });

    // Display results
    displayResults(score, results);
}

// Display results
function displayResults(score, results) {
    // Hide quiz container, show results
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';

    const totalQuestions = currentQuiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    document.getElementById('scoreValue').textContent = score;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('scorePercentage').textContent = `${percentage}%`;

    // Store results for details view
    window.quizResults = results;
    document.getElementById('detailsList').innerHTML = '';
}

// View details
function viewDetails() {
    const detailsDiv = document.getElementById('quizDetails');
    const detailsListDiv = document.getElementById('detailsList');

    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        detailsListDiv.innerHTML = window.quizResults.map((result, index) => `
            <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-header">
                    <strong>Question ${index + 1}</strong>
                    <span class="result-badge">${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                </div>
                <p class="result-question">${result.question}</p>
                <div class="result-answers">
                    <div class="answer-item ${result.isCorrect ? '' : 'user-answer'}">
                        <strong>Your Answer:</strong> ${result.userAnswer}
                    </div>
                    ${!result.isCorrect ? `
                        <div class="answer-item correct-answer">
                            <strong>Correct Answer:</strong> ${result.correctAnswer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } else {
        detailsDiv.style.display = 'none';
    }
}

// Restart quiz (go back to selection)
function restartQuiz() {
    currentQuiz = null;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    document.getElementById('quizSelection').style.display = 'block';
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('quizDetails').style.display = 'none';
    
    loadAvailableQuizzes();
}

