const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/carSellingDB', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', { username: String, email: String, password: String });

const Contact = mongoose.model('Contact', { name: String, email: String, message: String });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/api', apiRouter);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Login route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            console.log('Login attempt - User not found');
            return res.redirect('/login');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            console.log('Login successful');
            return res.redirect('/');
        } else {
            console.log('Login attempt - Incorrect password');
            alert('Incorrect username or password');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Incorrect username or password');
    }
});

// Signup route
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            console.log('Signup attempt - Username or email already in use');
            return res.redirect('/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log('User created:', newUser);
        return res.redirect('/login');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Contact route
app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/public/contact.html');
});

app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });

    try {
        await newContact.save();
        console.log('Contact message received:', newContact);
        return res.redirect('/');
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/featured-cars', async (req, res) => {
    const featuredCars = [{ make: 'Brand', model: 'Model', price: 25000 }];
    res.json(featuredCars);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
