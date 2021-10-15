const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
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
//verify the user
const verifyUser = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/user-signin')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  res.render('user/home', { user, bagCount })
});

router.get('/user-signup', userAuth, (req, res) => {
  res.render('user/signup')
})

router.get('/user-signin', userAuth, (req, res) => {
  res.render('user/signin', { usererr: req.session.loginError })
  req.session.loginError = false
})

router.get('/dogretailvet', async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let products = await productHelper.getProducts()
  res.render('user/dogretail&vet', { products, user, bagCount })
})

router.get('/catretailvet', (req, res) => {
  let user = req.session.user
  res.render('user/catretail&vet', { user })
})

router.get('/doggrooming', (req, res) => {
  res.render('user/doggrooming')
})

router.get('/catgrooming', (req, res) => {
  res.render('user/catgrooming')
})
router.get('/myorders', verifyUser, (req, res) => {
  res.send("Coming soon")
})

router.get('/checkout', verifyUser, async (req, res) => {
  let user = req.session.user
  let products = await userhelpers.getMybag(user._id);
  if (products != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let addressDetails = await userhelpers.getAddress(user._id)
    // console.log(addressDetails);
    res.render('user/checkout', { totalPrice, addressDetails, user })
  } else {
    res.redirect('/mybag')
  }
})
// address page 
router.get('/address', verifyUser, (req, res) => {
  res.render('user/address')
})

// add address
router.post('/add-address', async (req, res) => {
  let user = req.session.user._id
  await userhelpers.addAddress(user, req.body)
  res.redirect('/checkout')
})


router.get('/payment', verifyUser, async (req, res) => {
  let user = req.session.user
  let products = await userhelpers.getMybag(user._id);
  if (products != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let addressDetails = await userhelpers.getAddress(user._id)
    res.render('user/payment', { totalPrice, addressDetails, user })
  } else {
    res.redirect('/mybag')
  }
})
router.post('/place-order', verifyUser, async (req, res) => {
  console.log(req.body);
  let products = await userhelpers.getBagProductList(req.body.user)
  let totalPrice = await userhelpers.getTotalprice(req.body.user)
  let addressDetails = await userhelpers.getAddress(user._id)
  await userhelpers.placeOrder(req.body, addressDetails, products, totalPrice).then((response) => {

  })
  res.render('user/success')
})

//my bag 
router.get('/mybag', verifyUser, async (req, res) => {
  let user = req.session.user
  // console.log(user._id);
  let products = await userhelpers.getMybag(user._id);
  if (products.length != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    // console.log(products);
    res.render('user/mybag', { user, products, totalPrice })
  } else {
    res.render('user/mybag', { cartempty: true })
  }

})


//user signup
router.post('/signup', async (req, res) => {
  const response = await userhelpers.userSignup(req.body)
  res.redirect('/user-signin')
})


// user signin
router.post('/signin', async (req, res) => {
  const response = await userhelpers.userLogin(req.body)
  if (response && response.status) {
    req.session.loggedIn = true
    req.session.user = response.user
    res.redirect('/')
  } else {

    req.session.loginError = true
    res.redirect('/user-signin')
  }

})

router.get('/single-product/:id', async (req, res) => {
  let proId = req.params.id
  // console.log(proId);
  let product = await productHelpers.getSingleproduct(proId)
  res.render('user/product-detail', { product })
})

// Add-to-bag
router.get('/add-to-bag/:id', verifyUser, (req, res) => {

  userhelpers.addtoBag(req.params.id, req.session.user._id).then(() => {
    // res.json({ status: true })
  })
  res.redirect('/dogretailvet')
})

// change bag product quantity
router.post('/change-quantity', async (req, res) => {
  // console.log(req.body.user);
  let products = await userhelpers.getMybag(req.body.user);
  if (products.length != 0) {
    userhelpers.changeQuantity(req.body).then(async (response) => {
      response.totalPrice = await userhelpers.getTotalprice(req.body.user)
      // console.log(response);
      res.json(response)
    })
  }
})

// delete bag item
router.post('/delete-item', verifyUser, async (req, res) => {
  // console.log(req.body);
  const response = await userhelpers.deletebagItem(req.body)
  // console.log(response);
  res.json(response)
})







// user signout
router.get('/signout', (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false
  res.redirect('/')
})



module.exports = router;
