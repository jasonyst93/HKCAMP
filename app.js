if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
//if we are in development (production) mode. Put env in node. So,we can access it.


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user'); // include user model
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const MongoStore = require('connect-mongo');

//mongodb://localhost:27017/yelp-camp

mongoose.connect(dbUrl, {
    //useNewUrlParser: true,
    //useCreateIndex: true,
    //useUnifiedTopology: true,
    //useFindAndModify: false
})

const db = mongoose.connection; //easy to access as 'db'
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


const app = express(); // use express by app.xxx

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECERT || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60//any change on session ->  no change - 24hrs update once
})

store.on("error", function (e) { //error handling on store
    console.log("Session store error", e)
})

const sessionConfig = {
    store, //pass MongoStore in
    name: 'session',//just another name 
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //accept http only!!No Javascript
        //secure:true, //only work on https (localhost is not applied)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //will be expired a week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());
// app.use(helmet()); //including this breaks the CSP

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvkzyfskf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dvkzyfskf/"],
            childSrc: ["blob:"]
        }
    })
);


//Add these middleware, may look at the doc for more details
app.use(passport.initialize());
app.use(passport.session()); //must below app.use(session(sessionConfig))
//Thanks for pligin on models/user.js
passport.use(new LocalStrategy(User.authenticate())); //use LocalStrategy and pass in User model and use authenticate function
passport.serializeUser(User.serializeUser())//how do we get data and how do we store a user in the session
passport.deserializeUser(User.deserializeUser()); //how do we unstore of the session

app.use((req, res, next) => { //take everything in every request middleware
    res.locals.currentUser = req.user; //Global. All template can access currentUser
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/review', reviewRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {
    res.render('home')
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})