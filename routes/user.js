const { Code } = require('bson');
const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userhelpers = require('../helpers/user-helpers')
const { OAuth2Client } = require('google-auth-library');
const paypal = require('paypal-rest-sdk');
// 
const servicesSSID = "	VAcc710d22d3d0cb7e51e0a59715f643c3"
const accountSSID = "ACbe1c37edc9560c82fe7b569d383d98b3"
const authToken = "a92ad84f0903387bf5ffcf9ccc862d6a"
const clientTwillo = require("twilio")(accountSSID, authToken);


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AebeaDk4-599KvvXLTcbVns3IkqL1X5K8DQLfsSVWcm1pwWurlnIjgpDuh6-EhnDMMATk7mXJDXYU8S0',
  'client_secret': 'EMmhRE1l7_oOaDUPXTYaPsX-0Qc5Wty8WAjlSzf_Q_uWmglAxEEmmMaw8uMrANq7X3scqIY1vtDi4h9X'
});


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
  await productHelpers.checkExpiryoffer()

  let products = await productHelper.getDogProducts()
  res.render('user/home', { products, user, bagCount })

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
  let products = await productHelper.getDogProducts()
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
  console.log(otp);
  let number = req.session.number
  console.log(number);
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

router.get('/catretailvet', async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let products = await productHelper.getCatProducts()
  res.render('user/catretail&vet', { user, bagCount, products })
})

router.get('/doggrooming', async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let products = await productHelper.getDogProducts()
  res.render('user/doggrooming', { products, bagCount })
})

router.get('/catgrooming', async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let products = await productHelper.getCatProducts()
  res.render('user/catgrooming', { products })
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
    let products = await productHelpers.getMyOrderProd(req.params.id)
    console.log(products);
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
    let offerTotal = await userhelpers.getTotalofferprice(user._id)

    await userhelpers.getAddress(user._id).then((addressDetails) => {
      // console.log(addressDetails);
      res.render('user/checkout', { totalPrice, offerTotal, addressDetails, user })
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
  let user = req.session.user
  if (req.session.user.OrderConfirmed) {
    res.render('user/success', { user })
    req.session.user.OrderConfirmed = false
  } else {
    res.redirect('/')
  }
})

router.post('/place-order', verifyUser, async (req, res) => {
  console.log(req.body);
  let user = req.session.user
  let address = req.body.address
  let payment = req.body.payment
  await productHelpers.getBagProductList(user._id).then(async (products) => {
    let response = await productHelpers.checkCoupon(req.body.couponCode)
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let Total = await userhelpers.getTotalofferprice(user._id)
    console.log(Total);
    //
    let price;
    if (response) {
      let minamount = response.minamount
      let percent = response.value
      if (Total >= minamount) {
        console.log("1st keri", Total);

        console.log('keriii');
        var disPrice = (percent / 100) * Total;
        var couponPrice = Total - disPrice
        // console.log(couponPrice);
        price = couponPrice;
        // console.log(response);
        await productHelpers.saveCouponuser(user._id, response._id)

      } else {
        price = Total

      }

    } else {

      price = Total


    }

    // console.log(products);
    await userhelpers.getSelectedAdd(user._id, address).then(async (addressDetails) => {
      await userhelpers.placeOrder(addressDetails, products, price, payment, user._id).then((orderId) => {
        if (req.body['payment'] === 'COD') {

          req.session.user.OrderConfirmed = true
          res.json({ codsuccess: true })

        } else if (req.body['payment'] === 'RAZORPAY') {
          userhelpers.generateRazorpay(orderId, price).then((response) => {
            req.session.user.OrderConfirmed = true
            // console.log(response);
            res.json({ res: response, razorpay: true })
          })
        } else if (req.body['payment'] === 'PAYPAL') {
          const create_payment_json = {
            "intent": "sale",
            "payer": {
              "payment_method": "paypal"
            },
            "redirect_urls": {
              "return_url": "http://localhost:3000/successs",
              "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
              "item_list": {
                "items": [{
                  "name": "Red Sox Hat",
                  "sku": "001",
                  "price": price,
                  "currency": "USD",
                  "quantity": 1
                }]
              },
              "amount": {
                "currency": "USD",
                "total": price
              },
              "description": "Hat for the best team ever"
            }]
          };

          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              console.log(error);
              throw error;
            } else {
              for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                  res.json({ paypalsuccess: true, link: payment.links[i].href })
                }
              }
            }
          });

        }
      })
    })

    // console.log(addressDetails);


  })
})

router.get('/successs', async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  let user = req.session.user
  let totalPrice = await userhelpers.getTotalprice(user._id)
  let Total = await userhelpers.getTotalofferprice(user._id)
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": Total
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      // console.log("keriii");
      // console.log(JSON.stringify(payment));
      req.session.user.OrderConfirmed = true
      res.redirect("/success")
    }
  });
});
router.get('/cancel', (req, res) => res.send('Cancelled'));

//my bag 
router.get('/mybag', verifyUser, async (req, res) => {
  let user = req.session.user
  // console.log(user._id);
  let products = await userhelpers.getMybag(user._id);
  // console.log(products);
  if (products.length != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let offerTotal = await userhelpers.getTotalofferprice(user._id)
    console.log("----", offerTotal);
    await userhelpers.getSingleprice(user._id).then((singlePrice) => {
      // console.log(singlePrice);
      res.render('user/mybag', { user, products, totalPrice, offerTotal, singlePrice })
    })
  } else {
    res.render('user/mybag', { cartempty: true, user })
  }

})

//user signup
router.post('/signup', async (req, res) => {
  await userhelpers.checkPhone(req.body.phone).then(async (response) => {
    await userhelpers.checkEmailExist(req.body.mail).then(async (mail) => {
      if (!response && !mail) {
        let newUser = await userhelpers.userSignup(req.body)
        res.json({ newUser: true })
      } else {
        res.json({ response: false })
      }
    })
  })
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
      let response = await userhelpers.googleSignup(payload)
      // console.log(response);
      req.session.loggedIn = true
      req.session.user = response
      res.status(201).json(response)

    }
  } catch (error) {

    res.status(400).json(error)
  }

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
  } else if (!response.status) {
    res.json(response)
  }
  else {
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
    await userhelpers.getBagcount(user._id).then(async (bagCount) => {
      // console.log(alreadyAdded);
      let product = await productHelpers.getSingleproduct(proId)
      let alreadyAdded = await productHelpers.checkProdinBag(proId, user._id)
      res.render('user/product-detail', { product, user, bagCount, alreadyAdded })

    })
  } else {
    let product = await productHelpers.getSingleproduct(proId)
    res.render('user/product-detail', { product })
  }
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
    await productHelpers.buyNowProducts(id).then(async (prodDetails) => {
      res.render('user/buynow', { user, addressDetails, prodDetails })
    })
  })
})

router.get('/buy-address/:id', verifyUser, async (req, res) => {
  // console.log(req.params);
  let id = req.params.id
  res.render('user/buy-address', { id })
})
router.post('/buy-address/:id', verifyUser, async (req, res) => {
  let user = req.session.user
  // console.log(user);
  await userhelpers.addBuyAddress(user._id, req.body)
  res.json(response)
})

router.post('/buy-place-order', verifyUser, async (req, res) => {
  // console.log(req.body);
  let user = req.session.user
  let address = req.body.address
  let proId = req.body.proId
  let payment = req.body.payment
  // console.log(payment);
  await productHelpers.buyNowProducts(proId).then(async (products) => {
    let totalPrice = products[0].price
    // console.log(products);
    await userhelpers.getSelectedAdd(user._id, address).then(async (addressDetails) => {
      await userhelpers.buyPlaceOrder(addressDetails, products, totalPrice, payment, user._id).then((orderId) => {
        console.log("order", orderId);
        if (req.body['payment'] === 'COD') {
          req.session.user.OrderConfirmed = true
          res.json({ codsuccess: true })

        } else if (req.body['payment'] === 'RAZORPAY') {
          userhelpers.generateRazorpay(orderId, totalPrice).then((response) => {
            req.session.user.OrderConfirmed = true
            // console.log(response);
            res.json(response)
          })
        } else if (req.body['payment'] === 'PAYPAL') {

        }

      })
    })
  })
})


// change bag product quantity
router.post('/change-quantity', async (req, res) => {
  let products = await userhelpers.getMybag(req.body.user);
  if (products.length != 0) {
    userhelpers.changeQuantity(req.body).then(async (response) => {
      response.totalPrice = await userhelpers.getTotalprice(req.body.user)
      singlePrice = await userhelpers.getSingleprice(req.body.user)
      res.json(response)

    })
  }
})

// delete bag item
router.post('/delete-item', verifyUser, async (req, res) => {
  const response = await userhelpers.deletebagItem(req.body)
  res.json(response)
})

router.post('/verify-payment', (req, res) => {
  // console.log(req.body);
  userhelpers.verifyPayment(req.body).then(() => {
    userhelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("paymentsuccess");
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false })
  })
})

router.post('/deletefinalbag', async (req, res) => {
  let user = req.session.user
  await userhelpers.deleteFinalBag(user._id).then((response) => {
    res.json({ response: true })
  })
})

//user Profile
router.get('/userprofile', verifyUser, async (req, res) => {
  let user = req.session.user
  if (user) {
    await userhelpers.userDetails(user._id).then(async (userDetails) => {
      // console.log(userDetails);
      await userhelpers.passwordExist(user._id).then(async (Exist) => {
        // console.log(Exist);
        await userhelpers.getBagcount(user._id).then(async (bagCount) => {
          res.render('user/user-profile', { Exist, user, userDetails, bagCount })
        })
      })
    })
  }
})

router.post('/userprofile/editmail', verifyUser, async (req, res) => {
  // console.log(req.body)
  let user = req.session.user
  await userhelpers.EmailExist(req.body.email).then(async (response) => {
    // console.log(response);
    if (response) {
      res.json({ changed: false })
    } else {
      await userhelpers.updateUsermail(user._id, req.body.email).then(() => {
        res.json({ changed: true })
      })
    }
  })
})

router.post('/userprofile/editPhone', verifyUser, async (req, res) => {
  // console.log(req.body)
  let user = req.session.user
  await userhelpers.checkPhone(req.body.number).then(async (response) => {
    // console.log(response);
    if (response) {
      res.json({ changed: false })
    } else {
      await userhelpers.updateUserphone(user._id, req.body.number).then(() => {
        res.json({ changed: true })
      })
    }
  })
})
//create password for google users 
router.post('/userprofile/create-password', async (req, res) => {
  let user = req.session.user
  await userhelpers.createPassword(user._id, req.body.password).then(() => {
    res.json({ changed: true })
  })
})
//change password
router.post('/userprofile/change-password', async (req, res) => {
  let user = req.session.user
  await userhelpers.changePassword(user._id, req.body.password).then(async (response) => {
    if (response == true) {
      res.json({ changed: true })
    } else if (response == false) {
      res.json({ changed: false })
    }
  })
})

// apply coupon
router.post('/checkout/applycoupon', async (req, res) => {
  let user = req.session.user
  await productHelpers.checkCoupon(req.body.code).then(async (response) => {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    // console.log(totalPrice);
    let Total = await userhelpers.getTotalofferprice(user._id)
    console.log("kerii");
    if (response) {

      let couponUsed = await productHelpers.checkCouponUsed(req.session.user._id, response._id)
      console.log(couponUsed);
      if (!couponUsed) {
        let minamount = response.minamount
        let percent = response.value
        if (Total >= minamount) {
          var disPrice = (percent / 100) * Total;
          var couponPrice = Total - disPrice
          res.json({ couponPrice, message: "Coupon applied" })
        } else {
          res.json({ vmessage: true, message: "coupon valid for products above" + minamount })
        }

      } else {
        res.json({ umessage: true, uerrmessage: "Coupon already applied" })
      }
    } else {
      // console.log("kerii");
      res.json({ imessage: true, invalidmessage: "Invalid Coupon" })
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
