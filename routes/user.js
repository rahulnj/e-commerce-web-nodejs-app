const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userhelpers = require('../helpers/user-helpers')

// Auth middleware for user
const userAuth = (req, res, next) => {
  if (req.session.loggedIn) {

    res.redirect('/')
  } else {
    next()
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user

  res.render('user/home', { user })
});

router.get('/user-signup', userAuth, (req, res) => {
  res.render('user/signup')
})

router.get('/user-signin', userAuth, (req, res) => {
  res.render('user/signin')
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

//user signup
router.post('/signup', (req, res) => {
  userhelpers.doSignup(req.body).then((response) => {
    // console.log(req.body);
    res.redirect('/user-signin')
  })
})

// user signin
router.post('/signin', (req, res) => {
  userhelpers.userLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      res.redirect('/user-signin')
    }
  })
})

// user signout
router.get('/signout', (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false
  res.redirect('/')
})






module.exports = router;
