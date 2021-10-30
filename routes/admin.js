const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userhelpers = require('../helpers/user-helpers')
const fs = require('fs');
const { Db } = require('mongodb');

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
  res.render('admin/admin-login', { nonav: true, adminerr: req.session.adminError })
  req.session.adminError = false
});

//admin signin
router.post('/dashboard', async (req, res) => {
  // console.log(req.body);
  const response = await userhelpers.adminLogin(req.body)
  if (response && response.status) {
    req.session.loggedin = true
    req.session.admin = response.admin
    res.json(response)
    // res.render('admin/admin-dashboard', { admin: true })
  } else {
    req.session.adminError = true
    res.redirect('/admin')
  }

})

router.get('/dashboard', adminAuth, (req, res) => {
  res.render('admin/admin-dashboard', { admin: true })
})

router.get('/orders', adminAuth, async (req, res) => {
  await userhelpers.orderDetailsAdmin().then((orders) => {
    res.render('admin/admin-orders', { admin: true, orders })
  })
})
router.get('/orderdetails/:id', adminAuth, async (req, res) => {
  // console.log(req.params.id);
  await userhelpers.getAdminOrders(req.params.id).then(async (orderdetails) => {
    await userhelpers.getSinglepriceAdmin(req.params.id, orderdetails).then(async (singlePrice) => {
      await productHelpers.getadminOrderProd(req.params.id).then(async (products) => {
        // console.log(orderdetails);
        const isCancelled = orderdetails[0].status === 'cancelled'
        // console.log(isCancelled);
        res.render('admin/admin-orderdetails', { admin: true, orderdetails, isCancelled, singlePrice, products, })

        // console.log(products);
      })
    })
  })
})
// 
router.post('/changestatus', async (req, res) => {
  // console.log(req.body.cart);
  let cart = req.body.cart
  let user = req.body.user
  let status = req.body.status
  await userhelpers.changestatus(cart, user, status).then((response) => {
    // console.log(response);
    res.json(response)
  })
})







router.get('/products', adminAuth, async (req, res) => {
  let products = await productHelper.getProducts()
  // console.log(products);
  // console.log(JSON.stringify(products))
  res.render('admin/admin-products', { admin: true, products })
})

router.get('/addproduct', adminAuth, async (req, res) => {
  let details = await productHelper.categoryDetails()

  res.render('admin/admin-addproduct', { admin: true, details })

})

router.get('/category', adminAuth, async (req, res) => {
  let details = await productHelper.categoryDetails()
  res.render('admin/admin-category', { admin: true, details })
})

// creating category
router.post('/createCategory', (req, res) => {
  let cat = req.body.category
  let sub = req.body.subcategory
  let type = req.body.type
  productHelper.createCategory(cat, sub, type).then(() => {
    res.redirect('/admin/category')
  })
})
// Delete category
router.get('/delete-category/:id', async (req, res) => {
  let categoryId = req.params.id
  // console.log(categoryId);
  await productHelper.deleteCategory(categoryId)
  res.redirect('/admin/category')
})
// show category
router.post('/getSubcategory', async (req, res) => {
  // console.log(req.body);
  let show = await productHelper.showSubcategory(req.body.detail)
  res.json({ category: show })
  // console.log(show.subcategory);

})


router.get('/users', adminAuth, async (req, res) => {
  await userhelpers.usersDetails().then((newusers) => {
    // console.log(newusers);
    res.render('admin/admin-user', { admin: true, newusers })
  })
})

// edit products
router.get('/editproduct/:id', adminAuth, async (req, res) => {
  let proId = req.params.id
  // console.log(req.params.id);
  let product = await productHelpers.editProduct(proId)
  res.render('admin/admin-editproduct', { admin: true, product })
})

router.post('/editproduct/:id', async (req, res) => {
  // console.log("call");
  let proId = req.params.id
  // console.log("------------");
  // console.log(req.body);
  await productHelpers.updateProduct(proId, req.body)

  // console.log(req.files);
  res.redirect('/admin/products')
  if (req.body) {
    if (req.body.image1_b64 || req.body.image2_b64 || req.body.image3_b64 || req.body.image4_b64 || req.body.image5_b64) {
      // console.log(req.body.img1);
      if (req.body.image1_b64) {
        let image1 = req.body.image1_b64
        let path1 = './public/uploads/image-1/' + proId + '.jpg'
        let img1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, "")
        fs.writeFileSync(path1, img1, { encoding: 'base64' })


      }
      if (req.body.image2_b64) {
        let image2 = req.body.image2_b64
        let path2 = './public/uploads/image-2/' + proId + '.jpg'
        let img2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, "")
        fs.writeFileSync(path2, img2, { encoding: 'base64' })


      }
      if (req.body.image3_b64) {
        let image3 = req.body.image3_b64
        let path3 = './public/uploads/image-3/' + proId + '.jpg'
        let img3 = image3.replace(/^data:([A-Za-z-+/]+);base64,/, "")
        fs.writeFileSync(path3, img3, { encoding: 'base64' })

      }
      if (req.body.image4_b64) {
        let image4 = req.body.image4_b64
        let path4 = './public/uploads/image-4/' + proId + '.jpg'
        let img4 = image4.replace(/^data:([A-Za-z-+/]+);base64,/, "")
        fs.writeFileSync(path4, img4, { encoding: 'base64' })


      }
      if (req.body.image5_b64) {
        let image5 = req.body.image5_b64
        let path5 = './public/uploads/image-5/' + proId + '.jpg'
        let img5 = image5.replace(/^data:([A-Za-z-+/]+);base64,/, "")
        fs.writeFileSync(path5, img5, { encoding: 'base64' })

      }
      // console.log(image1);
    }
  }
})



//delete product 
router.post('/products/deleteproduct', async (req, res) => {
  let proId = req.body.proId
  let response = await productHelpers.deleteProducts(proId)
  res.json(response)
  // res.redirect('/admin/products')
})


// block users
router.post('/users/block-user', async (req, res) => {
  let userId = req.body.userId
  await userhelpers.blockUser(userId).then((response) => {
    res.json(response)
  })
})

router.post('/users/unblock-user', async (req, res) => {
  let userId = req.body.userId
  await userhelpers.unblockUser(userId).then((response) => {
    res.json(response)
  })
})
//blockuser end

//add product
router.post('/add-product', async (req, res) => {
  proDetails = {
    product: req.body.product,
    description: req.body.description,
    category: req.body.category,
    subcategory: req.body.subcategory,
    type: req.body.type,
    price: parseInt(req.body.price),
    qty: parseInt(req.body.quantity)
  }

  let id = await productHelpers.addProduct(proDetails)
  id = id.toString()
  let image1 = req.body.img1
  let image2 = req.body.img2
  let image3 = req.body.img3
  let image4 = req.body.img4
  let image5 = req.body.img5
  // console.log(image2);

  let path1 = './public/uploads/image-1/' + id + '.jpg'
  let path2 = './public/uploads/image-2/' + id + '.jpg'
  let path3 = './public/uploads/image-3/' + id + '.jpg'
  let path4 = './public/uploads/image-4/' + id + '.jpg'
  let path5 = './public/uploads/image-5/' + id + '.jpg'

  let img1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  let img2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  let img3 = image3.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  let img4 = image4.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  let img5 = image5.replace(/^data:([A-Za-z-+/]+);base64,/, "")


  fs.writeFileSync(path1, img1, { encoding: 'base64' })
  fs.writeFileSync(path2, img2, { encoding: 'base64' })
  fs.writeFileSync(path3, img3, { encoding: 'base64' })
  fs.writeFileSync(path4, img4, { encoding: 'base64' })
  fs.writeFileSync(path5, img5, { encoding: 'base64' })

  res.json({ status: true })
})

///coupon///

router.get('/coupons', adminAuth, async (req, res) => {
  let coupons = await productHelpers.displayCoupon()
  res.render('admin/admin-coupon', { admin: true, coupons })
})


router.post('/coupons/add-coupon', async (req, res) => {
  // console.log(req.body);
  await productHelpers.addCoupon(req.body)
  res.json(response)
})

router.post('/coupons/delete-coupon', async (req, res) => {
  // console.log("Api call");
  console.log(req.body);
  let response = await productHelpers.deleteCoupon(req.body.copId)
  console.log(response);
  res.json(response)
})


router.get('/productoffer', adminAuth, async (req, res) => {
  let products = await productHelpers.getProducts()
  let offerProducts = await productHelpers.displayProductoffer()
  res.render('admin/admin-productoffer', { admin: true, products, offerProducts })
})

router.post('/productoffer/placeprodoffer', async (req, res) => {
  console.log(req.body);
  let singleprod = await productHelpers.getSingleproduct(req.body.product)
  console.log(singleprod.price);
  let percent = req.body.offer
  var disPrice = (percent / 100) * singleprod.price;
  var offerprice = singleprod.price - disPrice
  // console.log(couponPrice);
  await productHelpers.getProductoffer(req.body.product, req.body.offer, offerprice, req.body.expiry)
})

router.get('/categoryoffer', adminAuth, (req, res) => {
  res.render('admin/admin-categoryoffer', { admin: true })
})
router.post('/categoryoffer/placecatoffer', async (req, res) => {
  // console.log(req.body);
  await productHelpers.getCategoryoffer(req.body.category, req.body.type, req.body.offer, req.body.expiry)
})



router.get('/logout', (req, res) => {
  req.session.loggedin = false;
  res.redirect('/admin')
})



module.exports = router;
