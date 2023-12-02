// server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (Make sure you have MongoDB running)
mongoose.connect('mongodb://localhost:27017/quizdb', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

// Authentication middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    newUser.save(err => {
        if (err) {
            res.status(500).send('Error registering user');
        } else {
            res.status(201).send('User registered successfully');
        }
    });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).send('Invalid password');

    const accessToken = jwt.sign({ username: user.username }, 'your-secret-key');
    res.json({ accessToken });
});

// Example protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ data: 'This is a protected route' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/onlinequiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Define your routes here

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/onlinequiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Use routes
app.use('/api/quizzes', quizRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



