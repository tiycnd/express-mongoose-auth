const path = require('path'),
      express = require('express'),
      mustacheExpress = require('mustache-express'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      BasicStrategy = require('passport-http').BasicStrategy,  
      flash = require('express-flash-messages'),
      mongoose = require('mongoose'),
      models = require('./models'),
      User = models.User;

const app = express();

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/test', {useMongoClient: true});

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache')
app.set('layout', 'layout');
app.use('/static', express.static('static'));

const authenticateUser = function(username, password, done) {
    User.authenticate(username, password, function(err, user) {
        if (err) {
            return done(err)
        }
        if (user) {
            return done(null, user)
        } else {
            return done(null, false, {
                message: "There is no user with that username and password."
            })
        }
    })
}

passport.use(new LocalStrategy(authenticateUser));
passport.use(new BasicStrategy(authenticateUser));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use('/api', require('./routes/api'));
app.use('/', require("./routes/base"));

app.listen(3000, function() {
    console.log('Express running on http://localhost:3000/.')
});
