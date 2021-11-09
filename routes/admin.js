const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userhelpers = require('../helpers/user-helpers')
const fs = require('fs');
const { Db } = require('mongodb');
const { count, log } = require('console');

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
  const response = await userhelpers.adminLogin(req.body)
  if (response && response.status) {
    req.session.loggedin = true
    req.session.admin = response.admin
    res.json(response)
  } else {
    req.session.adminError = true
    res.redirect('/admin')
  }

})

router.post('/dashboard/weeklyReport', async (req, res) => {

  let weeklyReport = await productHelpers.getweeklyreport()
  let weeklyUserReport = await productHelpers.getWeeklyUsers()
  let weeklyDeliveredReport = await productHelpers.getDeliverdCount()
  let weeklyCancelledReport = await productHelpers.getCancelledCount()
  let weeklyPlacedReport = await productHelpers.getPlacedCount()
  let rvdogs = await productHelpers.salesretailandvetdogs()
  let rvcats = await productHelpers.salesretailandvetcats()
  let adogs = await productHelpers.accessoriesdogs()
  let acats = await productHelpers.accessoriescats()
  res.json({
    data: weeklyReport, userdata: weeklyUserReport, deliverdReport: weeklyDeliveredReport,
    cancelReport: weeklyCancelledReport, placeReport: weeklyPlacedReport, reportrvdogs: rvdogs,
    reportrvcats: rvcats, reportadogs: adogs, reportacats: acats
  })
})


function getpercentage(count, paymentcount) {
  return Math.round((paymentcount / count) * 100)
}

router.get('/dashboard', adminAuth, async (req, res) => {
  let usersCount = await productHelpers.getUsersCount()
  let ordersCount = await productHelpers.getOrdersCount()
  let totalRevenue = await productHelpers.getTotalRevenue()
  let codCount = await productHelpers.getCodCount()
  let codPer = getpercentage(ordersCount, codCount)
  let razorpayCount = await productHelpers.getRazorpayCount()
  let razorpayPer = getpercentage(ordersCount, razorpayCount)
  let paypalCount = await productHelpers.getPaypalCount()
  let paypalPer = getpercentage(ordersCount, paypalCount)
  res.render('admin/admin-dashboard', { admin: true, usersCount, ordersCount, totalRevenue, codPer, razorpayPer, paypalPer })
})

router.get('/orders', adminAuth, async (req, res) => {
  await userhelpers.orderDetailsAdmin().then((orders) => {
    res.render('admin/admin-orders', { admin: true, orders })
  })
})

router.get('/orderdetails/:id', adminAuth, async (req, res) => {
  await userhelpers.getAdminOrders(req.params.id).then(async (orderdetails) => {
    await userhelpers.getSinglepriceAdmin(req.params.id, orderdetails).then(async (singlePrice) => {
      await productHelpers.getadminOrderProd(req.params.id).then(async (products) => {
        const isCancelled = orderdetails[0].status === 'cancelled'
        res.render('admin/admin-orderdetails', { admin: true, orderdetails, isCancelled, singlePrice, products, })
      })
    })
  })
})
// 
router.post('/changestatus', async (req, res) => {
  let cart = req.body.cart
  let user = req.body.user
  let status = req.body.status
  await userhelpers.changestatus(cart, user, status).then((response) => {
    res.json(response)
  })
})

router.get('/products', adminAuth, async (req, res) => {
  let products = await productHelper.getProducts()
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
//Edit category

router.post('/edit-category', async (req, res) => {
  let singleCat = await productHelpers.showEditCategory(req.body.catId)
  res.json({ category: singleCat })
})

router.post('/editcategory', async (req, res) => {
  await productHelpers.updateCategory(req.body.catId, req.body).then((response) => {
    console.log(response);
    res.json({ category: singleCat })
  })
})

// Delete category
router.get('/delete-category/:id', async (req, res) => {
  let categoryId = req.params.id
  await productHelper.deleteCategory(categoryId)
  res.redirect('/admin/category')
})
// show category
router.post('/getSubcategory', async (req, res) => {
  let show = await productHelper.showSubcategory(req.body.detail)
  res.json({ category: show })
})


router.get('/users', adminAuth, async (req, res) => {
  await userhelpers.usersDetails().then((newusers) => {
    res.render('admin/admin-user', { admin: true, newusers })
  })
})

// edit products
router.get('/editproduct/:id', adminAuth, async (req, res) => {
  let proId = req.params.id
  let product = await productHelpers.editProduct(proId)
  res.render('admin/admin-editproduct', { admin: true, product })
})

router.post('/editproduct/:id', async (req, res) => {
  let proId = req.params.id
  await productHelpers.updateProduct(proId, req.body)
  res.redirect('/admin/products')
  if (req.body) {
    if (req.body.image1_b64 || req.body.image2_b64 || req.body.image3_b64 || req.body.image4_b64 || req.body.image5_b64) {
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
    }
  }
})



//delete product 
router.post('/products/deleteproduct', async (req, res) => {
  let proId = req.body.proId
  let response = await productHelpers.deleteProducts(proId)
  res.json(response)
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
  await productHelpers.addCoupon(req.body)
  res.json(response)
})

router.post('/coupons/delete-coupon', async (req, res) => {
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
  let singleprod = await productHelpers.getSingleproduct(req.body.product)
  let percent = req.body.offer
  var disPrice = (percent / 100) * singleprod.price;
  var offerprice = singleprod.price - disPrice
  await productHelpers.getProductoffer(req.body.product, req.body.offer, offerprice, req.body.expiry)
  res.json(response)
})

router.get('/categoryoffer', adminAuth, (req, res) => {
  res.render('admin/admin-categoryoffer', { admin: true })
})
router.post('/categoryoffer/placecatoffer', async (req, res) => {
  await productHelpers.getCategoryoffer(req.body.category, req.body.type, req.body.offer, req.body.expiry)
})


router.post('/salesreport/report', async (req, res) => {
  let salesReport = await productHelpers.getSalesReport(req.body.from, req.body.to)
  res.json({ report: salesReport })
})

router.post('/salesreport/monthlyreport', async (req, res) => {
  let singleReport = await productHelpers.getNewSalesReport(req.body.type)
  res.json({ wmyreport: singleReport })
})

router.get('/salesreport', adminAuth, async (req, res) => {
  let salesreport = await productHelpers.getsalesReport()
  res.render('admin/salesreport', { admin: true, salesreport })
})


router.get('/logout', (req, res) => {
  req.session.loggedin = false;
  res.redirect('/admin')
})

router.post('/admin-search-product', async (req, res) => {
  console.log("api call");
  await productHelpers.searchProduct(req.body.key).then((result) => {
    if (result) {
      res.json({ body: result })
    } else {
      res.json({ body: false })
    }
  })
})

router.get('/customization', adminAuth, (req, res) => {
  res.render('admin/admin-banners', { admin: true })
})

router.post('/customization', async (req, res) => {

  let image1 = req.body.img1
  let image2 = req.body.img2

  let path1 = `./public/uploads/banner/banner1.jpg`
  let path2 = `./public/uploads/banner/banner2.jpg`

  let img1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  let img2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, "")

  if (img1 && img2) {
    fs.writeFileSync(path1, img1, { encoding: 'base64' })
    fs.writeFileSync(path2, img2, { encoding: 'base64' })
  } else if (img1) {
    fs.writeFileSync(path1, img1, { encoding: 'base64' })
  } else if (img2) {
    fs.writeFileSync(path2, img2, { encoding: 'base64' })
  }
  else if (img1 && img3) {
    fs.writeFileSync(path1, img1, { encoding: 'base64' })
    fs.writeFileSync(path3, img3, { encoding: 'base64' })
  }
  else if (img1) {
    fs.writeFileSync(path1, img1, { encoding: 'base64' })
  }
  else if (img2) {
    fs.writeFileSync(path2, img2, { encoding: 'base64' })
  }
  res.json({ status: true })
})

router.get('/bannertext', adminAuth, async (req, res) => {
  let banner = await productHelpers.getBannerText()
  res.render('admin/admin-bannertext', { banner, admin: true })
})

router.post('/bannertext', async (req, res) => {
  console.log(req.body);
  await productHelpers.changeBannertext(req.body)
  res.json({ status: true })
})




module.exports = router;
