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

  const el = document.getElementById('timerDisplay');
  if (el) {
    el.textContent = `${displayMinutes}:${displaySeconds}`;
  }
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
    q2: 'Mars',
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
  const timerEl = document.getElementById('timerDisplay');
  if (timerEl) timerEl.textContent = '00:00';
  const containerEl = document.getElementById('quizContainer');
  if (containerEl) containerEl.innerHTML = '';

  // Reset user inputs
  const inputElements = document.querySelectorAll('input');
  inputElements.forEach((input) => (input.value = ''));
}
// quizTaker.js
// Simulated backend logic
const quizQuestions = [
  {
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswer: 'Paris',
  },
  {
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Jupiter', 'Mars', 'Venus'],
    correctAnswer: 'Jupiter',
  },
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
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('questionContainer')) {
    displayQuestion();
  }
});
// backendLogic.js
// Sample data for quizzes (replace with actual data from your backend)
const quizzes = [
  {
    id: 1,
    title: 'Sample Quiz 1',
    questions: [
      { question: 'What is 2 + 2?', options: ['3', '4', '5'], correctAnswer: '4' },
      {
        question: 'Which is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris'],
        correctAnswer: 'Paris',
      },
    ],
  },
  // Add more quizzes as needed
];

// Function to display quizzes on the quizList.html page (with search/pagination)
async function displayQuizzes(page = 1) {
  const quizListContainer = document.getElementById('quizList');
  const searchInput = document.getElementById('searchInput');
  const pagination = document.getElementById('pagination');
  if (!quizListContainer) return;
  quizListContainer.innerHTML = '';
  if (pagination) pagination.innerHTML = '';

  const q = searchInput ? searchInput.value.trim() : '';
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', String(page));
  params.set('limit', '10');

  try {
    const res = await fetch(`/api/quizzes?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load quizzes');
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;
    if (!Array.isArray(items) || items.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No quizzes available yet.';
      quizListContainer.appendChild(li);
      return;
    }
    items.forEach((quiz) => {
      const listItem = document.createElement('li');
      const id = quiz._id || quiz.id;
      listItem.innerHTML = `<a href="quiz.html?id=${id}">${quiz.title}</a>`;
      quizListContainer.appendChild(listItem);
    });
    const totalPages = data.pages || 1;
    if (pagination && totalPages > 1) {
      for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement('button');
        btn.textContent = String(p);
        if (p === (data.page || page)) btn.disabled = true;
        btn.addEventListener('click', () => displayQuizzes(p));
        pagination.appendChild(btn);
      }
    }
  } catch (e) {
    const li = document.createElement('li');
    li.textContent = 'Failed to load quizzes.';
    quizListContainer.appendChild(li);
  }
}

// Function to display quiz questions on the quiz.html page (radio options + submission)
async function displayQuiz(quizId) {
  const quizContainer = document.getElementById('quizContainer');
  const quizContent = document.getElementById('quizContent');
  if (!quizContainer || !quizContent) return;
  quizContent.innerHTML = '';

  let quiz = null;
  try {
    const res = await fetch(`/api/quizzes/${quizId}`);
    if (res.ok) {
      quiz = await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch quiz:', e);
  }

  if (!quiz) {
    alert('Quiz not found!');
    return;
  }

  quizContainer.style.display = 'block';
  quizContent.insertAdjacentHTML('beforeend', `<h1>${quiz.title}</h1>`);
  (quiz.questions || []).forEach((q, index) => {
    const questionElement = document.createElement('div');
    questionElement.className = 'question-container';
    const optionsHTML = q.options
      .map((opt) => `<label><input type="radio" name="q_${index}" value="${opt}"> ${opt}</label>`)
      .join('');
    questionElement.innerHTML = `
            <p>${index + 1}. ${q.question}</p>
            <div>${optionsHTML}</div>
        `;
    quizContent.appendChild(questionElement);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit Quiz';
  submitButton.onclick = async () => {
    const answers = (quiz.questions || []).map((q, idx) => {
      const selected = (document.querySelector(`input[name="q_${idx}"]:checked`) || {}).value || '';
      return { selected };
    });
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error('submit failed');
      const result = await res.json();
      alert(`Your Score: ${result.score} / ${result.total}`);
      window.location.href = `quizResults.html?id=${quizId}`;
    } catch (e) {
      alert('Failed to submit quiz.');
    }
  };
  quizContent.appendChild(submitButton);
}

// Function to simulate submitting a quiz and show results
function submitQuizResults() {
  alert('This function has been replaced by server submission.');
}
// userAuthentication.js
// Sample user data (replace with actual user data from your backend)
let authToken = localStorage.getItem('authToken') || '';

async function registerUser(event) {
  if (event && event.preventDefault) event.preventDefault();
  const registerForm = document.getElementById('registerForm');
  const username = registerForm.querySelector('#username').value;
  const password = registerForm.querySelector('#password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    window.location.href = 'login.html';
  } catch (e) {
    alert('Registration failed.');
  }
}

async function loginUser(event) {
  if (event && event.preventDefault) event.preventDefault();
  const loginForm = document.getElementById('loginForm');
  const username = loginForm.querySelector('#username').value;
  const password = loginForm.querySelector('#password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    window.location.href = 'index.html';
  } catch (e) {
    alert('Invalid username or password. Please try again.');
  }
}

// Quiz Creator helpers
function addQuestion() {
  const container = document.getElementById('questionsContainer');
  if (!container) return;

  const index = container.children.length;
  const wrapper = document.createElement('div');
  wrapper.className = 'question-container';
  wrapper.innerHTML = `
                <label>Question ${index + 1}:</label>
                <input type="text" class="qc-question" placeholder="Enter question text" required>
                <div class="option-container">
                    <label>Option A:</label>
                    <input type="text" class="qc-option" placeholder="Option A" required>
                    <label>Option B:</label>
                    <input type="text" class="qc-option" placeholder="Option B" required>
                    <label>Option C:</label>
                    <input type="text" class="qc-option" placeholder="Option C" required>
                    <label>Option D:</label>
                    <input type="text" class="qc-option" placeholder="Option D" required>
                </div>
                <label>Correct Answer (copy one option exactly):</label>
                <input type="text" class="qc-correct" placeholder="Correct answer" required>
            `;
  container.appendChild(wrapper);
}

async function submitCreatedQuiz() {
  const titleInput = document.getElementById('quizTitle');
  const questionsContainer = document.getElementById('questionsContainer');
  if (!titleInput || !questionsContainer) return;

  const title = titleInput.value.trim();
  const questionBlocks = Array.from(
    questionsContainer.getElementsByClassName('question-container'),
  );
  const questions = questionBlocks.map((block) => {
    const question = block.querySelector('.qc-question').value.trim();
    const options = Array.from(block.querySelectorAll('.qc-option'))
      .map((i) => i.value.trim())
      .filter(Boolean);
    const correctAnswer = block.querySelector('.qc-correct').value.trim();
    return { question, options, correctAnswer };
  });

  if (!title || questions.length === 0) {
    alert('Please provide a title and at least one question.');
    return;
  }

  try {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title, questions }),
    });
    if (!res.ok) throw new Error('Failed to create quiz');
    alert('Quiz created successfully');
    window.location.href = 'quizList.html';
  } catch (e) {
    const fb = document.getElementById('creatorFeedback');
    if (fb) fb.textContent = 'Error creating quiz. Are you logged in?';
  }
}
