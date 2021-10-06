var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userhelpers = require('../helpers/user-helpers')


// Auth middleware for admin
const adminAuth = (req, res, next) => {
  if (!req.session.loggedin) {
    res.redirect('/admin')
  } else {
    next()
  }
}
// Auth middleware for admin
const adminReauth = (req, res, next) => {
  if (req.session.loggedin) {
    res.redirect('/admin/dashboard')
  } else {
    next()
  }
}

/*Admin login page*/
router.get('/', adminReauth, function (req, res, next) {
  res.render('admin/admin-login', { nonav: true })
});

//admin signin
router.post('/dashboard', (req, res) => {
  userhelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedin = true
      req.session.admin = response.admin
      res.render('admin/admin-dashboard', { admin: true })
    } else {
      res.redirect('/admin')
    }
  })
})

router.get('/dashboard', adminAuth, (req, res) => {
  // console.log(req.session.admin);
  res.render('admin/admin-dashboard', { admin: true })
})

router.get('/orders', adminAuth, (req, res) => {
  res.render('admin/admin-orders', { admin: true })
})

router.get('/products', adminAuth, (req, res) => {
  res.render('admin/admin-products', { admin: true })
})

router.get('/addproduct', adminAuth, (req, res) => {
  res.render('admin/admin-addproduct', { admin: true })
})

router.get('/users', adminAuth, (req, res) => {
  userhelpers.usersDetails().then((newusers) => {
    res.render('admin/admin-user', { admin: true, newusers })
  })
})

router.get('/editproduct', adminAuth, (req, res) => {
  res.render('admin/admin-editproduct', { admin: true })
})

router.get('/orderdetails', adminAuth, (req, res) => {
  res.render('admin/admin-orderdetails', { admin: true })
})

router.get('/offers', adminAuth, (req, res) => {
  res.send('coming soon')
})

// block users
router.get('/users/blockuser/:id', async (req, res) => {
  let userId = req.params.id
  console.log(userId);
  let user = await userhelpers.blockUser(userId)
  res.redirect("/admin/users")
})
router.post('/users/blockuser', async (req, res) => {
  userhelpers.blockUser(req.params.id, req.body).then(() => {

  })
})

//unblock user
router.get('/users/unblockuser/:id', async (req, res) => {
  let userId = req.params.id
  console.log(userId);
  let user = await userhelpers.unblockUser(userId)
  res.redirect("/admin/users")
})
router.post('/users/unblockuser', async (req, res) => {
  userhelpers.unblockUser(req.params.id, req.body).then(() => {

  })
})














router.get('/logout', (req, res) => {
  req.session.loggedin = false;
  res.redirect('/admin')
})



module.exports = router;
