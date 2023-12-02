// timer.js
let timer;
let timerSeconds = 0;
let timerMinutes = 0;

function startTimer() {
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timerSeconds++;
    if (timerSeconds === 60) {
        timerSeconds = 0;
        timerMinutes++;
    }

    const displayMinutes = timerMinutes < 10 ? `0${timerMinutes}` : timerMinutes;
    const displaySeconds = timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds;

    document.getElementById('timerDisplay').textContent = `${displayMinutes}:${displaySeconds}`;
}
 
// quizLogic.js
function startQuiz() {
    document.querySelector('.quiz-container').style.display = 'block';
    startTimer();
}

function submitQuiz() {
    // Sample scoring logic
    const answers = {
        q1: 'Paris',
        q2: 'Mars'
        // Add more answers as needed
    };

    let score = 0;

    for (const questionId in answers) {
        const userAnswer = document.getElementById(questionId).value.trim();
        const correctAnswer = answers[questionId];

        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            score++;
        }
    }

    // Display the score
    alert(`Your Score: ${score} / ${Object.keys(answers).length}`);

    // Stop the timer
    clearInterval(timer);

    // Optionally, you can reset the timer and quiz for a retake
    timerSeconds = 0;
    timerMinutes = 0;
    document.getElementById('timerDisplay').textContent = '00:00';
    document.getElementById('quizContainer').innerHTML = '';

    // Reset user inputs
    const inputElements = document.querySelectorAll('input');
    inputElements.forEach(input => input.value = '');
}
// quizTaker.js
// Simulated backend logic
const quizQuestions = [
    { question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctAnswer: "Paris" },
    { question: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Mars", "Venus"], correctAnswer: "Jupiter" },
    // Add more questions as needed
];

let currentQuestionIndex = 0;
let score = 0;

function nextQuestion() {
    const selectedOption = document.querySelector('input[name="option"]:checked');

    if (selectedOption) {
        if (selectedOption.value === quizQuestions[currentQuestionIndex].correctAnswer) {
            score++;
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < quizQuestions.length) {
            displayQuestion();
        } else {
            displayScore();
        }
    } else {
        document.getElementById('feedback').textContent = 'Please select an option.';
    }
}

function displayQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const currentQuestion = quizQuestions[currentQuestionIndex];

    let optionsHTML = '';
    for (let i = 0; i < currentQuestion.options.length; i++) {
        optionsHTML += `<label><input type="radio" name="option" value="${currentQuestion.options[i]}"> ${currentQuestion.options[i]}</label><br>`;
    }

    questionContainer.innerHTML = `<p>${currentQuestion.question}</p>${optionsHTML}`;
    document.getElementById('feedback').textContent = '';
}

function displayScore() {
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.innerHTML = `<p>Your final score is: ${score} out of ${quizQuestions.length}</p>`;
    document.getElementById('feedback').textContent = '';
}

// Initial display
displayQuestion();
// backendLogic.js
// Sample data for quizzes (replace with actual data from your backend)
const quizzes = [
    {
        id: 1,
        title: "Sample Quiz 1",
        questions: [
            { question: "What is 2 + 2?", options: ["3", "4", "5"], correctAnswer: "4" },
            { question: "Which is the capital of France?", options: ["Berlin", "Madrid", "Paris"], correctAnswer: "Paris" }
        ]
    },
    // Add more quizzes as needed
];

// Function to display quizzes on the quizList.html page
function displayQuizzes() {
    const quizListContainer = document.getElementById("quizList");
    quizListContainer.innerHTML = "";

    quizzes.forEach(quiz => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="quiz.html?id=${quiz.id}">${quiz.title}</a>`;
        quizListContainer.appendChild(listItem);
    });
}

// Function to display quiz questions on the quiz.html page
function displayQuiz(quizId) {
    const quiz = quizzes.find(q => q.id == quizId);

    if (quiz) {
        const quizContainer = document.getElementById("quizContainer");
        quizContainer.innerHTML = `<h1>${quiz.title}</h1>`;

        quiz.questions.forEach((q, index) => {
            const questionElement = document.createElement("div");
            questionElement.innerHTML = `
                <p>${index + 1}. ${q.question}</p>
                <ul>
                    ${q.options.map(option => `<li>${option}</li>`).join('')}
                </ul>
            `;
            quizContainer.appendChild(questionElement);
        });

        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit Quiz";
        submitButton.onclick = submitQuiz;
        quizContainer.appendChild(submitButton);
    } else {
        alert("Quiz not found!");
    }
}

// Function to simulate submitting a quiz and show results
function submitQuiz() {
    // Logic to gather user answers and compare with correct answers
    // Display the user's score and correct answers

    alert("Quiz submitted! Display results here.");
}
// userAuthentication.js
// Sample user data (replace with actual user data from your backend)
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
    // Add more users as needed
];

function registerUser() {
    const registerForm = document.getElementById('registerForm');
    const username = registerForm.querySelector('#username').value;
    const password = registerForm.querySelector('#password').value;

    // Check if the username is unique
    const isUnique = !users.some(user => user.username === username);

    if (isUnique) {
        // Add the new user to the users array (replace with backend registration logic)
        users.push({ username, password });

        // Redirect to the login page
        window.location.href = 'login.html';
    } else {
        alert('Username already exists. Please choose a different username.');
    }
}

function loginUser() {
    const loginForm = document.getElementById('loginForm');
    const username = loginForm.querySelector('#username').value;
    const password = loginForm.querySelector('#password').value;

    // Check if the provided credentials match any user (replace with backend login logic)
    const isValidUser = users.some(user => user.username === username && user.password === password);

    if (isValidUser) {
        // Redirect to the home page or another authenticated page
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password. Please try again.');
    }
}
