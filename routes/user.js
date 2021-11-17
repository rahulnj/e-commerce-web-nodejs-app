const { Code } = require('bson');
const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userhelpers = require('../helpers/user-helpers')
const { OAuth2Client } = require('google-auth-library');
const paypal = require('paypal-rest-sdk');
const fs = require('fs');
// 
const servicesSSID = "VA6372e797caca0e71e2cffe91c11b5168"
const accountSSID = "AC2b16619f3603bb5447f6417cdd805f0d"
const authToken = "2514ef681766ef450acce3bcfaa85088"
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
  let banner = await productHelpers.getBannerText()
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  await productHelpers.checkExpiryoffer()
  let products = await productHelper.getDogProducts()
  res.render('user/home', { banner, products, user, bagCount, search: true })

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
  req.session.number = req.body.number
  await userhelpers.checkNumber(req.body.number).then((response) => {
    if (response) {
      console.log('session no', req.session.number);
      clientTwillo.verify.services(servicesSSID).verifications.create({ to: `+91${req.session.number}`, channel: "sms" })
        .then((verification) => console.log(verification.status));
      res.json({ number: true })
    } else {
      res.json({ number: false })
    }
  })
})

router.post('/verifyotp', async (req, res) => {
  let otp = req.body.otp
  let number = req.session.number
  await userhelpers.checkNumber(number).then((response) => {
    clientTwillo.verify.services(servicesSSID).verificationChecks
      .create({ to: `+91${number}`, code: `${otp}` }).then((resp) => {
        if (resp.valid == true && resp.status == 'approved') {
          req.session.loggedIn = true;
          req.session.user = response;
          req.session.user._id = response._id;
          res.json({ login: true })
        } else {
          res.json({ login: false })
        }
      })
  })
})
// otp end

router.post('/entersignupnumber', async (req, res) => {

  req.session.number = req.body.number
  await userhelpers.checkNumber(req.body.number).then((response) => {
    if (!response) {
      console.log('session no', req.session.number);
      clientTwillo.verify.services(servicesSSID).verifications.create({ to: `+91${req.session.number}`, channel: "sms" })
        .then((verification) => console.log(verification.status));
      res.json({ number: true })
    } else {
      res.json({ number: false })
    }
  })
})

router.post('/verifysignupotp', async (req, res) => {

  let otp = req.body.otp
  let number = req.session.number
  clientTwillo.verify.services(servicesSSID).verificationChecks
    .create({ to: `+91${number}`, code: `${otp}` }).then((resp) => {
      if (resp.valid == true && resp.status == 'approved') {
        res.json({ login: true })
      } else {
        res.json({ login: false })
      }
    })
})





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
  res.render('user/catgrooming', { user, bagCount, products })
})
router.get('/myorders', verifyUser, async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
    let orders = await userhelpers.getMyOrders(user._id)
    if (orders.length != 0) {
      res.render('user/myorders', { user, orders, bagCount })
    } else {
      res.render('user/myorders', { orderempty: true, user, bagCount })
    }
  }
})

// view order
router.get('/view-order/:id', verifyUser, async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  await userhelpers.getOneOrder(req.params.id).then(async (orders) => {
    let products = await productHelpers.getMyOrderProd(req.params.id)
    let IsPlaced = orders[0].status === 'placed'
    let IsCancelled = orders[0].status === 'cancelled'
    let IsDelivered = orders[0].status === 'delivered'
    let IsShipped = orders[0].status === 'shipped'
    let IsConfirmed = orders[0].status === 'confirmed'
    res.render('user/vieworders', { user, products, IsConfirmed, IsShipped, IsPlaced, IsCancelled, IsDelivered, orders, bagCount })
  })
})

router.post('/cancelorder', async (req, res) => {
  let cart = req.body.cart
  let status = req.body.status
  await userhelpers.cancelOrder(cart, status).then((response) => {
    res.json(response)
  })
})



router.get('/checkout', verifyUser, async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let products = await userhelpers.getMybag(user._id);
  if (products != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let offerTotal = await userhelpers.getTotalofferprice(user._id)
    await userhelpers.getAddress(user._id).then((addressDetails) => {
      res.render('user/checkout', { totalPrice, bagCount, offerTotal, addressDetails, user })
    })
  } else {
    res.redirect('/mybag')
  }
})
// address page 
router.get('/address', verifyUser, async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let profile = req.query.profile

  res.render('user/address', { user, profile, bagCount })
})

// add address
router.post('/add-address', async (req, res) => {
  let user = req.session.user._id
  await userhelpers.addAddress(user, req.body)
  res.json({ procheck: req.body.pro })

})
//delete address
router.post('/deleteaddress', async (req, res) => {
  let addId = req.body.add
  let userId = req.body.user
  let address = req.body.address
  await userhelpers.deleteAddress(addId, userId, address).then((response) => {
    res.json({ status: true })
  })
})

router.get('/editaddress/:id/:ad', async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  await productHelpers.getSingleAddress(user._id, req.params.id, req.params.ad).then((address) => {
    res.render('user/edit-address', { address, bagCount })
  })
})

router.post('/editaddress', async (req, res) => {
  let addobj = {
    fullname: req.body.fullname,
    address: req.body.address,
    city: req.body.city,
    place: req.body.place,
    pincode: req.body.pincode,
    phone: req.body.phone
  }
  let addorg = {
    fullname: req.body.fullnameo,
    address: req.body.addresso,
    city: req.body.cityo,
    place: req.body.placeo,
    pincode: req.body.pincodeo,
    phone: req.body.phoneo
  }
  let user = req.session.user
  await productHelpers.updateAddress(user._id, addobj, addorg).then((response) => {
    res.json(response)
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
  let user = req.session.user
  let address = req.body.address
  let payment = req.body.payment
  await productHelpers.getBagProductList(user._id).then(async (products) => {
    let response = await productHelpers.checkCoupon(req.body.couponCode)
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let Total = await userhelpers.getTotalofferprice(user._id)
    let price;
    if (response) {
      let minamount = response.minamount
      let percent = response.value
      if (Total >= minamount) {
        var disPrice = (percent / 100) * Total;
        var couponPrice = Total - disPrice
        price = couponPrice;
        req.session.user.Orderamount = price
        await productHelpers.saveCouponuser(user._id, response._id)
      } else {
        price = Total
        req.session.user.Orderamount = price
      }
    } else {
      price = Total
      req.session.user.Orderamount = price
    }
    if (address) {
      await userhelpers.getSelectedAdd(user._id, address).then(async (addressDetails) => {
        await userhelpers.placeOrder(addressDetails, products, price, payment, user._id).then((orderId) => {
          if (req.body['payment'] === 'COD') {
            req.session.user.OrderConfirmed = true
            res.json({ codsuccess: true })
          } else if (req.body['payment'] === 'RAZORPAY') {
            userhelpers.generateRazorpay(orderId, price).then((response) => {
              req.session.user.OrderConfirmed = true
              res.json({ res: response, razorpay: true })
            })
          } else if (req.body['payment'] === 'PAYPAL') {
            const create_payment_json = {
              "intent": "sale",
              "payer": {
                "payment_method": "paypal"
              },
              "redirect_urls": {
                "return_url": "https://shop.rahuljayaraman.tech/successs",
                "cancel_url": "https://shop.rahuljayaraman.tech/cancel"
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
    } else {
      res.json({ noaddress: true })
    }
  })
})

router.get('/successs', async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  let user = req.session.user
  await userhelpers.deleteFinalBag(user._id)
  let totalPrice = await userhelpers.getTotalprice(user._id)
  let Total = await userhelpers.getTotalofferprice(user._id)
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": req.session.user.Orderamount
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      req.session.user.OrderConfirmed = true
      res.redirect("/success")
    }
  });
});
router.get('/cancel', (req, res) => {
  res.redirect('/');
})
//my bag 
router.get('/mybag', verifyUser, async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let products = await userhelpers.getMybag(user._id);
  if (products.length != 0) {
    let totalPrice = await userhelpers.getTotalprice(user._id)
    let offerTotal = await userhelpers.getTotalofferprice(user._id)
    await userhelpers.getSingleprice(user._id).then((singlePrice) => {
      res.render('user/mybag', { user, bagCount, products, totalPrice, offerTotal, singlePrice })
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
    let guest;
    if (user && !user.status) {
      req.session.loggedIn = false
      res.status(401).json(user)
    }

    else if (user && user.status) {

      if (req.session.guestUser) {
        guest = req.session.guestUser
      }
      req.session.loggedIn = true
      req.session.user = user
      res.json({ user: user, guest })
    } else {
      let response = await userhelpers.googleSignup(payload)
      req.session.loggedIn = true
      req.session.user = response
      if (req.session.guestUser) {
        guest = req.session.guestUser
      }
      res.json({ response, guest })
    }
  } catch (error) {
    console.log("error");
    res.status(400).json(error)
  }

})

// user signin
router.post('/signin', async (req, res) => {
  const response = await userhelpers.userLogin(req.body)
  if (response && response.status) {
    req.session.loggedIn = true
    req.session.user = response.user
    let guest;
    if (req.session.guestUser) {
      guest = req.session.guestUser
    }
    res.json({ res: response, guest })
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
  let bagCount = null
  if (user) {
    await userhelpers.getBagcount(user._id).then(async (bagCount) => {
      let product = await productHelpers.getSingleproduct(proId)
      let alreadyAdded = await productHelpers.checkProdinBag(proId, user._id)
      res.render('user/product-detail', { product, user, bagCount, alreadyAdded })

    })
  } else {
    let product = await productHelpers.getSingleproduct(proId)
    res.render('user/product-detail', { product })
  }
})




// add to cart without user

router.get("/add-to-cart/:id", (req, res) => {
  if (req.session.user) {
    console.log("kerii");
    res.redirect(`/add-to-bag/${req.params.id}`)
  } else {
    let data = { proid: req.params.id }
    req.session.guestUser = data
    res.redirect("/user-signin")
  }

})


// Add-to-bag
router.get('/add-to-bag/:id', verifyUser, (req, res) => {
  console.log(req.session.user);
  if (req.session.user) {
    userhelpers.addtoBag(req.params.id, req.session.user._id).then(async () => {
      await userhelpers.getBagcount(req.session.user._id).then(async (bagCount) => {
        if (req.session.guestUser) {
          delete req.session.guestUser
          res.redirect("/mybag")
        } else {
          res.json({ status: true, count: bagCount })
        }

      })
    })
  }
})
//////buy now
router.post('/buy-checkout/:id', (req, res) => {
  res.json(response)
})


router.get('/buy-checkout/:id', verifyUser, async (req, res) => {
  const id = req.params.id
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  await userhelpers.getAddress(req.session.user._id).then(async (addressDetails) => {
    await productHelpers.buyNowProducts(id).then(async (prodDetails) => {
      res.render('user/buynow', { user, bagCount, addressDetails, prodDetails })
    })
  })
})

router.get('/buy-address/:id', verifyUser, async (req, res) => {
  let id = req.params.id
  res.render('user/buy-address', { id })
})
router.post('/buy-address/:id', verifyUser, async (req, res) => {
  let user = req.session.user
  await userhelpers.addBuyAddress(user._id, req.body)
  res.json(response)
})

router.post('/buy-place-order', verifyUser, async (req, res) => {
  let user = req.session.user
  let address = req.body.address
  console.log(address);
  let proId = req.body.proId
  let payment = req.body.payment
  let singleprice;
  await productHelpers.buyNowProducts(proId).then(async (products) => {
    let response = await productHelpers.checkCoupon(req.body.couponCode)
    if (products[0].isoffer == true) {
      singleprice = products[0].offerprice
      req.session.user.Orderamount = singleprice
    } else {
      singleprice = products[0].price
      req.session.user.Orderamount = singleprice
    }
    let price;
    if (response) {
      let minamount = response.minamount
      let percent = response.value
      if (singleprice >= minamount) {
        var disPrice = (percent / 100) * singleprice;
        var couponPrice = singleprice - disPrice
        price = couponPrice;
        req.session.user.Orderamount = price
        await productHelpers.saveCouponuser(user._id, response._id)
      } else {
        price = singleprice
        req.session.user.Orderamount = price
      }
    } else {
      price = singleprice
      req.session.user.Orderamount = price
    }
    if (address) {
      await userhelpers.getSelectedAdd(user._id, address).then(async (addressDetails) => {
        await userhelpers.buyPlaceOrder(addressDetails, products, price, payment, user._id).then((orderId) => {
          if (req.body['payment'] === 'COD') {
            req.session.user.OrderConfirmed = true
            res.json({ codsuccess: true })

          } else if (req.body['payment'] === 'RAZORPAY') {
            userhelpers.generateRazorpay(orderId, singleprice).then((response) => {
              req.session.user.OrderConfirmed = true
              res.json({ res: response, razorpay: true })
            })
          } else if (req.body['payment'] === 'PAYPAL') {
            const create_payment_json = {
              "intent": "sale",
              "payer": {
                "payment_method": "paypal"
              },
              "redirect_urls": {
                "return_url": "https://shop.rahuljayaraman.tech/successs",
                "cancel_url": "https://shop.rahuljayaraman.tech/cancel"
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
    } else {
      res.json({ noaddress: true })
    }
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
        "total": req.session.user.Orderamount
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      req.session.user.OrderConfirmed = true
      res.redirect("/success")
    }
  });
});
router.get('/cancel', (req, res) => {
  res.redirect('/');
})

// change bag product quantity
router.post('/change-quantity', async (req, res) => {
  let products = await userhelpers.getMybag(req.body.user);
  if (products.length != 0) {
    userhelpers.changeQuantity(req.body).then(async (response) => {
      response.Total = await userhelpers.getTotalofferprice(req.body.user)
      response.subtotal = await userhelpers.getSingle(req.body.cart, req.body.user, req.body.product)
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
  userhelpers.verifyPayment(req.body).then(() => {
    userhelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
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
      await userhelpers.getAddress(user._id).then(async (addressDetails) => {
        await userhelpers.passwordExist(user._id).then(async (Exist) => {
          await userhelpers.getBagcount(user._id).then(async (bagCount) => {
            res.render('user/user-profile', { Exist, user, userDetails, bagCount, addressDetails })
          })
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
    // console.log("kerii");
    if (response) {

      let couponUsed = await productHelpers.checkCouponUsed(req.session.user._id, response._id)
      // console.log(couponUsed);
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
      res.json({ imessage: true, invalidmessage: "Invalid Coupon" })
    }

  })
})

router.get('/wishlist', verifyUser, async (req, res) => {
  let user = req.session.user
  let bagCount = null
  if (user) {
    bagCount = await userhelpers.getBagcount(user._id)
  }
  let products = await userhelpers.getMyWishlist(user._id)
  if (products.length != 0) {
    res.render('user/wishlist', { products, user, bagCount })
  } else {
    res.render('user/wishlist', { wishlistempty: true, user, bagCount })
  }

})

router.get('/add-to-wishlist/:id', verifyUser, (req, res) => {
  if (req.session.user) {
    userhelpers.addtoWishlist(req.params.id, req.session.user._id).then((response) => {
      if (response.added) {
        res.json({ status: true })
      } else if (response.alreadyexist) {
        res.json({ alreadyexist: true })
      }
    })
  }
})

router.post('/delete-wish-item', verifyUser, async (req, res) => {
  const response = await userhelpers.deletewishItem(req.body)
  res.json(response)
})

router.get('/move-to-wishlist/:id', verifyUser, (req, res) => {
  if (req.session.user) {
    userhelpers.addtoBag(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })
    })
  }
})

router.post('/buy-checkout/buy-apply-coupon/:id', async (req, res) => {

  let proId = req.params.id
  let user = req.session.user

  await productHelpers.checkCoupon(req.body.code).then(async (response) => {
    let singleprice;
    await productHelpers.buyNowProducts(proId).then(async (products) => {
      if (products[0].isoffer == true) {
        singleprice = products[0].offerprice
        req.session.user.Orderamount = singleprice
      } else {
        singleprice = products[0].price
        req.session.user.Orderamount = singleprice
      }
      if (response) {
        let couponUsed = await productHelpers.checkCouponUsed(req.session.user._id, response._id)
        if (!couponUsed) {
          let minamount = response.minamount
          let percent = response.value
          if (singleprice >= minamount) {
            var disPrice = (percent / 100) * singleprice;
            var couponPrice = singleprice - disPrice
            res.json({ couponPrice, bmessage: "Coupon applied" })
          } else {
            res.json({ bvmessage: true, message: "coupon valid for products above" + minamount })
          }

        } else {
          res.json({ bumessage: true, uerrmessage: "Coupon already applied" })
        }
      } else {
        res.json({ bimessage: true, invalidmessage: "Invalid Coupon" })
      }
    })
  })
})

router.post('/search-product', async (req, res) => {
  await productHelpers.searchProduct(req.body.key).then((result) => {
    if (result) {
      res.json({ body: result })
    } else {
      res.json({ body: false })
    }
  })
})

router.post('/paginationdog', async (req, res) => {
  await productHelpers.searchdogProduct(req.body.cat).then((result) => {
    if (result) {
      res.json({ body: result })
    } else {
      res.json({ body: false })
    }
  })
})

router.post('/paginationcat', async (req, res) => {
  await productHelpers.searchcatProduct(req.body.cat).then((result) => {
    if (result) {
      res.json({ body: result })
    } else {
      res.json({ body: false })
    }
  })
})

router.post('/profilechange', async (req, res) => {
  let id = req.session.user._id
  let user1 = req.body.img1
  let path1 = './public/uploads/userprofile/' + id + '.jpg'
  let img1 = user1.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  fs.writeFileSync(path1, img1, { encoding: 'base64' })
  res.json({ status: true })
})




// user signout
router.get('/signout', (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false
  res.redirect('/')
})

module.exports = router;
