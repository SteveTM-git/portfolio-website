const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Define User model
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// *** Route to serve the signup/signin form (forms.html) ***
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'forms.html'));
});

// *** Place this AFTER the route definitions ***
// Serve static files (forms.html, index.html, styles.css, etc.)
app.use(express.static(__dirname));

// Route to handle Sign Up
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists' });
        }

        // Save new user to MongoDB
        const newUser = new User({ username, password });
        await newUser.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});

// Route to handle Sign In
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username and password match
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }

        // If credentials are valid, send a response to redirect to index.html
        res.json({ success: true, redirectUrl: '/index.html' });
    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});

// Route to serve index.html after successful sign-in
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
