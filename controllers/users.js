const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body; //get email username password from req.body
        const user = new User({ email, username });
        const registerdUser = await User.register(user, password); //take user and password then do hash stiff and store
        req.login(registerdUser, err => { //take registerUser and login
            if (err) return next(err); //handle error by req.login middleware
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds'; //if no session back to /campgrounds
    delete req.session.returnTo; //delete session
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); } //latest version we need to handle error 
        req.flash('success', "Goodbye!");
        res.redirect('/campgrounds');
    });
}; 