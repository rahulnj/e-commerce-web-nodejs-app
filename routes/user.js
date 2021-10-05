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

router.get('/dogretailvet', (req, res) => {
  res.render('user/dogretail&vet')
})

router.get('/catretailvet', (req, res) => {
  res.render('user/catretail&vet')
})

router.get('/doggrooming', (req, res) => {
  res.render('user/doggrooming')
})

router.get('/catgrooming', (req, res) => {
  res.render('user/catgrooming')
})



module.exports = router;
