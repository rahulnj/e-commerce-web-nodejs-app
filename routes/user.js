var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('user/home')
});

router.get('/user-signup', (req, res) => {
  res.render('user/signup')
})

router.get('/user-signin', (req, res) => {
  res.render('user/login')
})



module.exports = router;
