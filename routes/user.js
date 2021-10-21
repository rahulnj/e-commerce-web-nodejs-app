const { Code } = require('bson');
const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userhelpers = require('../helpers/user-helpers')
const { OAuth2Client } = require('google-auth-library');

// 
const servicesSSID = "	VAcc710d22d3d0cb7e51e0a59715f643c3"
const accountSSID = "ACbe1c37edc9560c82fe7b569d383d98b3"
const authToken = "a92ad84f0903387bf5ffcf9ccc862d6a"
const clientTwillo = require("twilio")(accountSSID, authToken);


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
//otp
router.get('/otp', (req, res) => {
  res.render('user/otp', { nonav: true })
})
router.get('/verifyotp', (req, res) => {
  res.render('user/enterotp', { nonav: true })
})

router.post('/enterotp', async (req, res) => {
  req.session.number = req.body.phone
  await userhelpers.checkNumber(req.body.phone).then((response) => {
    console.log(response);
    if (response) {
      console.log('session no', req.session.number);
      clientTwillo.verify.services(servicesSSID).verifications.create({ to: `+91${req.session.number}`, channel: "sms" })
        .then((verification) => console.log(verification.status));
      res.redirect('/verifyotp')

    } else {
      res.redirect('/user-signup')
    }
  })
})

router.post('/verifyotp', async (req, res) => {
  let otp = req.body.otp
  let number = req.session.number
  await userhelpers.checkNumber(number).then((response) => {
    req.session.user = response;
    req.session.user._id = response._id;
  })
  clientTwillo.verify.services(servicesSSID).verificationChecks
    .create({ to: `+91${number}`, code: `${otp}` }).then((resp) => {
      req.session.loggedIn = true;
      res.redirect('/')
    })
})
// otp end

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
  // console.log(user);
  if (user) {
    await userhelpers.getMyOrders(user._id).then(async (orders) => {
      // console.log(orders);
      res.render('user/myorders', { user, orders })
    })
  } else {
    res.render('user/myorders',)

  }
})

// view order
router.get('/view-order/:id', verifyUser, async (req, res) => {
  // console.log(req.params);
  let user = req.session.user
  await userhelpers.getOneOrder(req.params.id).then(async (orders) => {
    let products = await userhelpers.getMyOrderProd(req.params.id)
    let IsCancelled = orders[0].status === 'cancelled'
    let IsDelivered = orders[0].status === 'delivered'
    res.render('user/vieworders', { user, products, IsCancelled, IsDelivered, orders })
  })
})

router.post('/cancelorder', async (req, res) => {
  // console.log(req.body);
  let cart = req.body.cart
  let status = req.body.status
  await userhelpers.cancelOrder(cart, status).then((response) => {
    res.json(response)
  })
})



router.get('/checkout', verifyUser, async (req, res) => {
  let user = req.session.user
  let products = await userhelpers.getMybag(user._id);
  if (products != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    await userhelpers.getAddress(user._id).then((addressDetails) => {
      // console.log(addressDetails);
      res.render('user/checkout', { totalPrice, addressDetails, user })
    })
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
  // console.log(req.body);
  await userhelpers.addAddress(user, req.body)
  res.redirect('/checkout')
})
//delete address
router.post('/deleteaddress', async (req, res) => {
  // console.log(req.body.add);
  let addId = req.body.add
  let userId = req.body.user
  let address = req.body.address
  await userhelpers.deleteAddress(addId, userId, address).then((response) => {
    res.json({ status: true })
  })
})

router.get('/success', verifyUser, (req, res) => {
  res.render('user/success')
})

router.post('/place-order', verifyUser, async (req, res) => {
  // console.log(req.body);
  let user = req.session.user
  let address = req.body.address
  let payment = req.body.payment
  await userhelpers.getBagProductList(user._id).then(async (products) => {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    await userhelpers.getSingleprice(user._id).then(async (singlePrice) => {
      // console.log(products);
      await userhelpers.getSelectedAdd(user._id, address).then(async (addressDetails) => {
        await userhelpers.placeOrder(addressDetails, products, totalPrice, payment, user._id).then((response) => {
          res.json({ status: true })
        })
      })
    })
    // console.log(addressDetails);
  })
})


//my bag 
router.get('/mybag', verifyUser, async (req, res) => {
  let user = req.session.user
  // console.log(user._id);
  let products = await userhelpers.getMybag(user._id);
  if (products.length != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    await userhelpers.getSingleprice(user._id).then((singlePrice) => {
      // console.log(singlePrice);
      res.render('user/mybag', { user, products, totalPrice, singlePrice })
    })
  } else {
    res.render('user/mybag', { cartempty: true, user })
  }

})

//user signup
router.post('/signup', async (req, res) => {
  const response = await userhelpers.userSignup(req.body)
  res.redirect('/user-signin')
})

router.post('/signupwithgoogle', async (req, res) => {
  // console.log(req.body.token);

  try {
    const client = new OAuth2Client("509658893033-ru751qg63f9jrakv2iqekoa0c1jksfle.apps.googleusercontent.com")
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: "509658893033-ru751qg63f9jrakv2iqekoa0c1jksfle.apps.googleusercontent.com",
    })
    const payload = ticket.getPayload()
    const { email, name } = payload
    const user = await userhelpers.checkEmailExist(email)
    // console.log(user);
    if (user && !user.status) {

      req.session.loggedIn = false
      res.status(401).json(user)
    }
    else if (user && user.status) {

      req.session.loggedIn = true
      req.session.user = user
      res.json(user)

    } else {
      const response = await userhelpers.googleSignup(payload)
      res.status(201).json(response)

    }
  } catch (error) {
    // res.status(400)
    // throw new Error('Google Authentication failed')
    // console.log(error);
    res.status(400).json(error)
  }

  //const response = await userhelpers.userSignup(req.body)
  //res.redirect('/user-signin')
})













// user signin
router.post('/signin', async (req, res) => {
  // console.log(req.body);
  const response = await userhelpers.userLogin(req.body)
  if (response && response.status) {
    req.session.loggedIn = true
    req.session.user = response.user
    res.json(response)
    // console.log(response);
    // res.redirect('/')
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
//////buy now
router.post('/buy-checkout/:id', (req, res) => {
  // console.log(req.params.id);
  res.json(response)
})


router.get('/buy-checkout/:id', verifyUser, async (req, res) => {
  const id = req.params.id
  let user = req.session.user
  // console.log(id);
  // console.log(user);
  await userhelpers.getAddress(req.session.user._id).then(async (addressDetails) => {
    await userhelpers.buyNowProducts(id).then(async (prodDetails) => {
      res.render('user/buynow', { user, addressDetails, prodDetails })
    })
  })
})

router.post('/buy-place-order', verifyUser, async (req, res) => {
  console.log(req.body);
  let user = req.session.user
  console.log(user._id);
  let address = req.body.address
  let id = req.body.proId
  let payment = req.body.payment
  await userhelpers.buyNowProducts(id).then(async (products) => {
    let totalPrice = products[0].price
    console.log(products);
    await userhelpers.getSelectedAdd(user._id, address).then(async (addressDetails) => {
      await userhelpers.placeOrder(addressDetails, products, totalPrice, payment, user._id).then((response) => {
        res.json({ status: true })
      })
    })
  })
  // console.log(addressDetails);
})











// change bag product quantity
router.post('/change-quantity', async (req, res) => {
  // console.log(req.body.user);
  let products = await userhelpers.getMybag(req.body.user);
  if (products.length != 0) {
    userhelpers.changeQuantity(req.body).then(async (response) => {
      response.totalPrice = await userhelpers.getTotalprice(req.body.user)
      singlePrice = await userhelpers.getSingleprice(req.body.user)
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
//Buy Now






// user signout
router.get('/signout', (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false
  res.redirect('/')
})



module.exports = router;
