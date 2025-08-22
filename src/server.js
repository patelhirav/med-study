require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');
const { injectUser } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'devsecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
  })
);
app.use(injectUser);

app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/schedules', require('./routes/schedules'));
app.use('/achievements', require('./routes/achievements'));

app.use((req, res) => res.status(404).render('layouts/layout', { title: 'Not Found', body: '<div class="container"><h1>404</h1><p>Page not found.</p></div>' }));

const PORT = process.env.PORT || 5959;
app.listen(PORT, () => console.log(`MedStudyTrack running on http://localhost:${PORT}`));
