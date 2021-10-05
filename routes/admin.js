var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/admin-login', { admin: true })
});

router.post('/login', (req, res) => {
  res.render('admin/admin-dashboard', { admin: true })
})



router.get('/orders', (req, res) => {
  res.render('admin/admin-orders', { admin: true })
})

router.get('/products', (req, res) => {
  res.render('admin/admin-products', { admin: true })
})

router.get('/addproduct', () => {
  // res.render('admin/admin-addproduct', { admin: true })
  res.render("Edit user")
})

module.exports = router;
