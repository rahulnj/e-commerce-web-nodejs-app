var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/admin-login',)
});

router.post('/dashboard', (req, res) => {
  res.render('admin/admin-dashboard', { admin: true })
})

router.get('/dashboard', (req, res) => {
  res.render('admin/admin-dashboard', { admin: true })
})

router.get('/orders', (req, res) => {
  res.render('admin/admin-orders', { admin: true })
})

router.get('/products', (req, res) => {
  res.render('admin/admin-products', { admin: true })
})

router.get('/addproduct', (req, res) => {
  res.render('admin/admin-addproduct', { admin: true })
})

router.get('/users', (req, res) => {
  res.render('admin/admin-user', { admin: true })
})

router.get('/editproduct', (req, res) => {
  res.render('admin/admin-editproduct', { admin: true })
})

router.get('/orderdetails', (req, res) => {
  res.render('admin/admin-orderdetails', { admin: true })
})

router.get('/offers', (req, res) => {
  res.send('coming soon')
})




module.exports = router;
