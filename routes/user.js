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

router.get('/otp', (req, res) => {
  res.render('user/otp', { nonav: true })
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
router.get('/myorders', verifyUser, async (req, res) => {
  let user = req.session.user
  console.log(user);
  if (user) {
    let orders = await userhelpers.getMyOrders(user._id)
    console.log(orders);
    res.render('user/myorders', { user, orders })
  } else {
    res.render('user/myorders',)

  }
})

// 
router.get('/view-order/:id', verifyUser, async (req, res) => {
  let user = req.session.user
  let orders = await userhelpers.getMyOrders(user._id)
  let products = await userhelpers.getMyOrderProd(req.params.id)
  res.render('user/vieworders', { user, products, orders })
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

router.get('/success', verifyUser, (req, res) => {
  res.render('user/success')
})

// router.get('/payment', verifyUser, async (req, res) => {
//   let user = req.session.user
//   let products = await userhelpers.getMybag(user._id);
//   if (products != 0) {
//     let totalPrice = await userhelpers.getTotalprice(user._id)
//     let addressDetails = await userhelpers.getAddress(user._id)
//     console.log(addressDetails);
//     res.render('user/payment', { totalPrice, addressDetails, user })
//   } else {
//     res.redirect('/mybag')
//   }
// })

router.post('/place-order', verifyUser, async (req, res) => {
  // console.log(req.body);
  let user = req.session.user
  let address = req.body.address
  let payment = req.body.payment
  let products = await userhelpers.getBagProductList(user._id)
  let totalPrice = await userhelpers.getTotalprice(user._id)
  let addressDetails = await userhelpers.getSelectedAdd(user._id, address)
  // console.log(addressDetails);
  await userhelpers.placeOrder(addressDetails, products, totalPrice, payment, user._id).then((response) => {
    res.json({ status: true })
  })
  // res.render('user/success')
})

//my bag 
router.get('/mybag', verifyUser, async (req, res) => {
  let user = req.session.user
  // console.log(user._id);
  let products = await userhelpers.getMybag(user._id);
  if (products.length != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let singlePrice = await userhelpers.getSingleprice(user._id)
    // console.log(singlePrice);
    res.render('user/mybag', { user, products, totalPrice, singlePrice })
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
  let user = req.session.user
  // console.log(proId);
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let product = await productHelpers.getSingleproduct(proId)
  res.render('user/product-detail', { product, user, bagCount })
})

// Add-to-bag
router.get('/add-to-bag/:id', verifyUser, (req, res) => {
  // console.log('api call');
  if (req.session.user) {
    userhelpers.addtoBag(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })
    })
  }

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
