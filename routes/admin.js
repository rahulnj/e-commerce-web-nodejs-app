var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/admin-login', { admin: true })
});

router.post('/login', (req, res) => {
  res.render('admin/admin-dashboard', { admin: true })
})

module.exports = router;
