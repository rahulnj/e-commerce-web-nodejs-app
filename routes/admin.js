var express = require('express');
const productHelpers = require('../helpers/product-helpers');
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
  res.render('admin/admin-login', { nonav: true, adminerr: req.session.adminError })
  req.session.adminError = false
});

//admin signin
router.post('/dashboard', async (req, res) => {
  const response = await userhelpers.adminLogin(req.body)
  if (response && response.status) {
    req.session.loggedin = true
    req.session.admin = response.admin
    res.render('admin/admin-dashboard', { admin: true })
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
    // console.log(orders);
    res.render('admin/admin-orders', { admin: true, orders })
  })
})
router.get('/orderdetails/:id', adminAuth, async (req, res) => {
  // console.log(req.params.id);
  let orderdetails = await userhelpers.getMyOrders(req.params.id)
  // console.log(orderdetails);
  let products = await userhelpers.getadminOrderProd(req.params.id)
  res.render('admin/admin-orderdetails', { admin: true, orderdetails, products, })
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
  console.log(req.body);
  let show = await productHelper.showSubcategory(req.body.detail)
  res.json({ category: show })
  // console.log(show.subcategory);

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
  // console.log(req.files);
  res.redirect('/admin/products')
  if (req.files.img1 || req.files.img2 || req.files.img3 || req.files.img4) {
    // console.log(req.files.img1);
    let image1 = req.files.img1
    let image2 = req.files.img2
    let image3 = req.files.img3
    let image4 = req.files.img4
    let image5 = req.files.img5
    // console.log(image1);
    image1.mv('./public/uploads/image-1/' + proId + '.jpg')
    image2.mv('./public/uploads/image-2/' + proId + '.jpg')
    image3.mv('./public/uploads/image-3/' + proId + '.jpg')
    image4.mv('./public/uploads/image-4/' + proId + '.jpg')
    image5.mv('./public/uploads/image-5/' + proId + '.jpg')
  }

})


//delete product 
router.get('/deleteproduct/:id', async (req, res) => {
  let proId = req.params.id
  // console.log(proId);
  await productHelpers.deleteProducts(proId)
  res.redirect('/admin/products')
})



router.get('/offers', adminAuth, (req, res) => {
  res.send('coming soon')
})

// block users
router.get('/users/blockuser/:id', async (req, res) => {
  let userId = req.params.id
  // console.log(userId);
  let user = await userhelpers.blockUser(userId)
  res.redirect("/admin/users")
})

router.get('/users/unblockuser/:id', async (req, res) => {
  let userId = req.params.id
  // console.log(userId);
  let user = await userhelpers.unblockUser(userId)
  res.redirect("/admin/users")
})
//blockuser end

//add product
router.post('/add-product', async (req, res) => {

  let id = await productHelpers.addProduct(req.body)
  // console.log(req.body);
  id = id.toString()
  let image1 = req.files.img1
  let image2 = req.files.img2
  let image3 = req.files.img3
  let image4 = req.files.img4
  let image5 = req.files.img5
  image1.mv('./public/uploads/image-1/' + id + '.jpg')
  image2.mv('./public/uploads/image-2/' + id + '.jpg')
  image3.mv('./public/uploads/image-3/' + id + '.jpg')
  image4.mv('./public/uploads/image-4/' + id + '.jpg')
  image5.mv('./public/uploads/image-5/' + id + '.jpg')
  res.redirect('/admin/addproduct')
})







router.get('/logout', (req, res) => {
  req.session.loggedin = false;
  res.redirect('/admin')
})



module.exports = router;
