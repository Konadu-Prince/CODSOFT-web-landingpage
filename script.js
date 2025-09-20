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

// Legacy demo code removed

// Function to display quizzes on the quizList.html page (with search/pagination)
async function displayQuizzes(page = 1) {
  const quizListContainer = document.getElementById('quizList');
  const searchInput = document.getElementById('searchInput');
  const categoryInput = document.getElementById('categoryInput');
  const pagination = document.getElementById('pagination');
  if (!quizListContainer) return;
  quizListContainer.innerHTML = '';
  if (pagination) pagination.innerHTML = '';

  const q = searchInput ? searchInput.value.trim() : '';
  const category = categoryInput ? categoryInput.value.trim() : '';
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
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
      listItem.className = 'quiz-item';
      const id = quiz._id || quiz.id;
      const meta = [];
      if (quiz.category) meta.push(quiz.category);
      const subtitle = meta.length ? ` <small>(${meta.join(' - ')})</small>` : '';
      listItem.innerHTML = `<a href="quiz.html?id=${id}">${quiz.title}</a>${subtitle}`;
      if (quiz.description) {
        const p = document.createElement('p');
        p.textContent = quiz.description;
        listItem.appendChild(p);
      }
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
  const quizMeta = document.getElementById('quizMeta');
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
  if (quizMeta) {
    const parts = [];
    if (quiz.category) parts.push(quiz.category);
    if (quiz.description) parts.push(quiz.description);
    quizMeta.textContent = parts.join(' • ');
  }
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
        body: JSON.stringify({ answers, timeTaken: timerMinutes * 60 + timerSeconds }),
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

// Display quiz results for a given quiz id on quizResults.html
async function displayResults(quizId) {
  const container = document.getElementById('results');
  if (!container) return;
  container.innerHTML = '';
  try {
    const res = await fetch(`/api/quizzes/${quizId}/results`);
    if (!res.ok) throw new Error('Failed to load results');
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      container.textContent = 'No results yet.';
      return;
    }
    const ul = document.createElement('ul');
    rows.forEach((r) => {
      const li = document.createElement('li');
      const username = r.username || 'Anonymous';
      const created = r.createdAt ? new Date(r.createdAt).toLocaleString() : '';
      li.textContent = `${username}: ${r.score}/${r.total} in ${r.timeTaken || 0}s on ${created}`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  } catch (e) {
    container.textContent = 'Failed to load results.';
  }
}
// userAuthentication.js
// Sample user data (replace with actual user data from your backend)
let authToken = localStorage.getItem('authToken') || '';
// Expose functions used in inline HTML handlers
window.startQuiz = startQuiz;
window.displayQuizzes = displayQuizzes;
window.displayQuiz = displayQuiz;
window.displayResults = displayResults;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.addQuestion = addQuestion;
window.submitCreatedQuiz = submitCreatedQuiz;
window.logout = function logout() {
  try {
    localStorage.removeItem('authToken');
  } catch (e) {
    console.warn('Failed to clear auth token during logout:', e);
  }
  window.location.href = 'index.html';
};

async function registerUser(event) {
  if (event && event.preventDefault) event.preventDefault();
  const registerForm = document.getElementById('registerForm');
  const username = registerForm.querySelector('#username').value;
  const emailInput = registerForm.querySelector('#email');
  const email = emailInput ? emailInput.value : '';
  const password = registerForm.querySelector('#password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
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
  const categoryInput = document.getElementById('quizCategory');
  const descriptionInput = document.getElementById('quizDescription');
  const questionsContainer = document.getElementById('questionsContainer');
  if (!titleInput || !questionsContainer) return;

  const title = titleInput.value.trim();
  const category = categoryInput ? categoryInput.value.trim() : '';
  const description = descriptionInput ? descriptionInput.value.trim() : '';
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
      body: JSON.stringify({ title, category, description, questions }),
    });
    if (!res.ok) throw new Error('Failed to create quiz');
    alert('Quiz created successfully');
    window.location.href = 'quizList.html';
  } catch (e) {
    const fb = document.getElementById('creatorFeedback');
    if (fb) fb.textContent = 'Error creating quiz. Are you logged in?';
  }
}
