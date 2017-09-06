const express = require('express'),
      passport = require('passport'),
      session = require('express-session'),
      bodyParser = require('body-parser'),
      expressValidator = require('express-validator'),      
      models = require("../models"),
      flash = require('express-flash-messages'),
      mongoose = require('mongoose'),      
      User = models.User,      
      router = express.Router();

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(expressValidator());

router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new(require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 27017, // optional
        db: 'test', // optional
        collection: 'sessions', // optional
        expire: 86400 // optional
    })
}));

router.use(passport.initialize());
router.use(passport.session());
router.use(flash());


router.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
})

router.get('/', function(req, res) {
    res.render("index");
})

router.get('/login/', function(req, res) {
    res.render("login", {
        messages: res.locals.getMessages()
    });
});

router.post('/login/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login/',
    failureFlash: true
}))

router.get('/register/', function(req, res) {
    res.render('register');
});

router.post('/register/', function(req, res) {
    req.checkBody('username', 'Username must be alphanumeric').isAlphanumeric();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    req.getValidationResult()
       .then(function(result) {
           if (!result.isEmpty()) {
               return res.render("register", {
                   username: req.body.username,
                   errors: result.mapped()
               });
           }
           const user = new User({
               username: req.body.username,
               password: req.body.password
           })

           const error = user.validateSync();
           if (error) {
               return res.render("register", {
                   errors: normalizeMongooseErrors(error.errors)
               })
           }

           user.save(function(err) {
               if (err) {
                   return res.render("register", {
                       messages: {
                           error: ["That username is already taken."]
                       }
                   })
               }
               return res.redirect('/');
           })
       })
});

function normalizeMongooseErrors(errors) {
    Object.keys(errors).forEach(function(key) {
        errors[key].message = errors[key].msg;
        errors[key].param = errors[key].path;
    });
}

router.get('/logout/', function(req, res) {
    req.logout();
    res.redirect('/');
});

const requireLogin = function (req, res, next) {
    if (req.user) {
        next()
    } else {
        res.redirect('/login/');
    }
}

router.get('/secret/', requireLogin, function (req, res) {
    res.render("secret");
})

module.exports = router;
