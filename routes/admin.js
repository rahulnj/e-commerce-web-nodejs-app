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
  // console.log(req.session.admin);
  res.render('admin/admin-dashboard', { admin: true })
})

router.get('/orders', adminAuth, (req, res) => {
  res.render('admin/admin-orders', { admin: true })
})

router.get('/products', adminAuth, async (req, res) => {
  let products = await productHelper.getProducts()
  // console.log(products);

  // console.log(JSON.stringify(products))

  res.render('admin/admin-products', { admin: true, products })
})

router.get('/addproduct', adminAuth, (req, res) => {
  res.render('admin/admin-addproduct', { admin: true })
})
router.get('/category', adminAuth, (req, res) => {
  res.render('admin/admin-category', { admin: true })
})

// creating category
router.post('/createCategory', (req, res) => {
  let cat = req.body.category
  let sub = req.body.subcategory
  productHelper.createCategory(cat, sub, req.body).then(() => {

    res.redirect('/admin/category')
  })


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
    console.log(image1);
    image1.mv('./public/uploads/image-1/' + proId + '.jpg')
    image2.mv('./public/uploads/image-2/' + proId + '.jpg')
    image3.mv('./public/uploads/image-3/' + proId + '.jpg')
    image4.mv('./public/uploads/image-4/' + proId + '.jpg')
    image5.mv('./public/uploads/image-5/' + proId + '.jpg')
  }

})






// 
router.get('/deleteproduct/:id', async (req, res) => {
  let proId = req.params.id
  // console.log(proId);
  await productHelpers.deleteProducts(proId)
  res.redirect('/admin/products')
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
