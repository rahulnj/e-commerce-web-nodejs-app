const { response } = require('express');
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
  // console.log(req.body);
  await productHelpers.updateProduct(proId, req.body)

  // console.log(req.files);
  res.redirect('/admin/products')
  if (req.files) {
    if (req.files.img1 || req.files.img2 || req.files.img3 || req.files.img4) {
      // console.log(req.files.img1);
      if (req.files.img1) {
        let image1 = req.files.img1
        image1.mv('./public/uploads/image-1/' + proId + '.jpg')

      }
      if (req.files.img2) {
        let image2 = req.files.img2
        image2.mv('./public/uploads/image-2/' + proId + '.jpg')

      }
      if (req.files.img3) {
        let image3 = req.files.img3
        image3.mv('./public/uploads/image-3/' + proId + '.jpg')
      }
      if (req.files.img4) {
        let image4 = req.files.img4
        image4.mv('./public/uploads/image-4/' + proId + '.jpg')

      }
      if (req.files.img5) {
        let image5 = req.files.img5
        image5.mv('./public/uploads/image-5/' + proId + '.jpg')
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



router.get('/offers', adminAuth, (req, res) => {
  res.send('coming soon')
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
  // console.log(req.files);
  // console.log(req.body);
  // console.log(req.body.product);

  // console.log(data.product);
  let id = await productHelpers.addProduct(req.body)
  // console.log(req.body);
  id = id.toString()
  let image1 = req.files.file1
  let image2 = req.files.file2
  let image3 = req.files.file3
  let image4 = req.files.file4
  let image5 = req.files.file5
  image1.mv('./public/uploads/image-1/' + id + '.jpg')
  image2.mv('./public/uploads/image-2/' + id + '.jpg')
  image3.mv('./public/uploads/image-3/' + id + '.jpg')
  image4.mv('./public/uploads/image-4/' + id + '.jpg')
  image5.mv('./public/uploads/image-5/' + id + '.jpg')
  res.json({ status: true })
})







router.get('/logout', (req, res) => {
  req.session.loggedin = false;
  res.redirect('/admin')
})



module.exports = router;
