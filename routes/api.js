const express = require('express'),
      passport = require('passport'),
      bodyParser = require('body-parser'),
      expressValidator = require('express-validator'),      
      models = require("../models"),
      mongoose = require('mongoose'),      
      User = models.User,      
      router = express.Router();

router.use(bodyParser.json());
router.use(expressValidator());

router.get('/me/', passport.authenticate('basic', { session: false }), function (req, res) {
    res.json(req.user);
});

module.exports = router;
