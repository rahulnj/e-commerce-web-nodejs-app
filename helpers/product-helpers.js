var db = require('../config/connection')
var collection = require('../config/collections')
// const { ObjectId } = require('bson')
var objectId = require('mongodb').ObjectId
const { ObjectId } = require('bson')
const { Db, ReturnDocument } = require('mongodb')
const { response } = require('express')
const moment = require("moment")
const userHelpers = require('./user-helpers')
module.exports = {
    addProduct: async (productDetails) => {
        // console.log(productDetails);
        // proDetails = {
        //     product: productDetails.product,
        //     description: productDetails.description,
        //     category: productDetails.category,
        //     subcategory: productDetails.subcategory,
        //     type: productDetails.type,
        //     price: parseInt(productDetails.price),
        //     qty: parseInt(productDetails.quantity)
        // }
        // console.log(product);
        let data = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productDetails)
        return data.insertedId
    },

    getProducts: async (product) => {
        let proDetails = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        // console.log(proDetails);
        return proDetails
    },
    deleteProducts: async (product) => {
        let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(product) })
        return true
    },
    editProduct: async (product) => {
        let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(product) })
        return prodDetails
    },
    updateProduct: async (proId, product) => {
        // console.log(product);
        let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
            $set: {

                product: product.product,
                description: product.description,
                price: parseInt(product.price),
                qty: parseInt(product.qty)
            }
        })
        return prodDetails
    },
    getSingleproduct: async (proId, product) => {
        let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
        // console.log(prodDetails);
        return prodDetails
    },
    createCategory: (category, sub, type) => {
        return new Promise(async (resolve, reject) => {

            let categoryDetails = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category, "subcategory.name": sub })
            // console.log(categoryDetails);
            if (!categoryDetails) {
                let catDetails = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })
                if (catDetails) {
                    // console.log(categoryDetails);
                    // console.log("yeah");
                    if (sub) {
                        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: category }, {

                            $push: { subcategory: { name: sub } }

                        }
                        ).then((response) => {

                        });
                    }
                    typeManage();

                    function typeManage() {
                        let alreadyTypeFound = catDetails.type.find(elem => elem.name == type);
                        if (alreadyTypeFound) {
                            resolve()
                        }
                        else {
                            if (!type) {
                                resolve()
                            } else {
                                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: category }, {

                                    $push: { type: { name: type } }

                                }).then(() => {
                                    resolve();
                                })
                            }
                        }
                    }
                } else {
                    let createObj = {
                        category: category,
                        subcategory: [{ name: sub }],
                        type: [{ name: type }]
                    }
                    db.get().collection(collection.CATEGORY_COLLECTION).insertOne(createObj).then((response) => {
                        resolve()
                    })
                }

            } else {
                resolve()

            }
        })
    }, categoryDetails: async () => {
        let details = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        return details
    },
    deleteCategory: async (categoryId) => {
        let deleteCat = await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(categoryId) })
        return deleteCat
    },
    showSubcategory: async (category) => {
        let show = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category }, { subcategory: 0 })
        // console.log(show.subcategory);
        return show
    },
    getCatProducts: async (product) => {
        let proDetails = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: 'cat', type: 'retailandvet' }).toArray()
        // console.log(proDetails);
        return proDetails
    },
    checkProdinBag: (prodId, userId) => {

        return new Promise(async (resolve, reject) => {
            let userBag = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userBag) {
                let proExist = userBag.products.findIndex(product => product.item == prodId)
                if (proExist != -1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } else {
                resolve(false)
            }
        })
    },
    getDogProducts: async (product) => {
        let proDetails = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: 'dog', type: 'retailandvet' }).toArray()
        // console.log(proDetails);
        return proDetails
    },
    getBagProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            resolve(cart.products)
        })
    },
    getMyOrderProd: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                // {
                //     $project: {
                //         total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                //     }
                // },

            ]).toArray()
            // console.log(orderItems);
            resolve(orderItems)
        })
    },
    getadminOrderProd: (cartId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(cartId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                // {
                //     $project: {
                //         total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                //     }
                // },

            ]).toArray()
            // console.log(orderItems);
            resolve(orderItems)
        })
    },
    buyNowProducts: (proId) => {
        // console.log(proId);

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: ObjectId(proId) }).toArray().then((prod) => {
                resolve(prod)
                // console.log(prod);
            })

        })


    },
    addCoupon: (couponDetails) => {
        let coupon = {
            couponcode: couponDetails.couponcode,
            value: parseInt(couponDetails.value),
            description: couponDetails.description,
            createdAt: new Date(),
            expireAt: new Date(couponDetails.expiry),
            minamount: parseInt(couponDetails.minamount)
        }
        // console.log(coupon);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response) => {
                resolve()
            })
        })
    },
    displayCoupon: async () => {
        let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        return coupons
    },
    deleteCoupon: async (couponId) => {
        let copDetails = await db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(couponId) })
        return true
    },
    checkCoupon: (code) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponcode: code }).then((response) => {
                resolve(response)
                // console.log(response);
            })
        })
    },
    checkCouponUsed: (userId, couponId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) });
            if (user.coupons) {
                let couponExist = user.coupons.find(coupon => coupon.cid.equals(couponId))
                resolve(couponExist ? true : false);
            }
            else resolve(false)

        })
    },
    applyCoupon: (userId, couponPrice) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) }, {
                $set: {
                    couponprice: couponPrice,
                    couponapplied: true
                }
            }).then((response) => {
                resolve(response)

            })
        })
    },
    isCouponApplied: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) }, { couponapplied: true })
        })
    },
    saveCouponuser: (userId, couponId) => {
        // console.log(userId);
        // console.log(couponId);
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) });
            if (user.coupons) {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $push: { coupons: { cid: couponId } }
                }).then((response) => {
                    resolve()
                })
            } else {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $set: {
                        coupons: [{ cid: couponId }]
                    }
                }).then(() => {
                    resolve()
                })
            }
        })
    },
    getProductoffer: (prodId, offer, offerprice, expiry) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(prodId) }, {
                $set: {
                    expiry: new Date(expiry),
                    offer: offer,
                    offerprice: offerprice,
                    isoffer: true
                }
            })
        })
    },
    displayProductoffer: async () => {
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ isoffer: true }).toArray()
        // console.log(products);
        return products
    },
    checkExpiryoffer: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            products.forEach((i) => {
                if (i.isoffer) {
                    let date = new Date()
                    if (i.expiry < date) {
                        db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: ObjectId(i._id) },
                            {
                                $unset: { expiry: 1, isoffer: 1, offer: 1, offerprice: 1 }
                            }).then((response) => {
                                resolve()
                            })
                    } else {
                        resolve()
                    }
                } else {
                    resolve()
                }
            })
        })
    },
    getCategoryoffer: (cat, type, per, expiry) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: cat, type: type }).toArray()
            products.forEach((i) => {
                if (i.isoffer) {
                    if (i.offer < per) {
                        i.offer = per
                        let offer = i.price * per / 100
                        i.expiry = expiry
                        i.offerprice += offer
                    }
                } else {
                    i.isoffer = true
                    i.offer = per
                    i.offerprice = i.price - i.price * per / 100
                    i.expiry = expiry
                }
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(i._id) },
                    {
                        $set: { expiry: new Date(i.expiry), offer: i.offer, isoffer: true, offerprice: i.offerprice }
                    }).then(() => {
                        resolve()
                    })
            })
        })
    },
    getsalesReport: () => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { $and: [{ status: { $ne: 'cancelled' } }, { status: { $ne: 'pending' } }] }
                },
                {
                    $project: {
                        orderid: '$_id',
                        userid: '$user',
                        payment: '$paymentmethod',
                        amount: '$amount',
                        date: '$date',
                        products: '$products'
                    }
                },
                // {
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         localField: 'item',
                //         foreignField: '_id',
                //         as: 'products'
                //     }
                // },

            ]).toArray()
            // console.log("----------------------");
            // console.log(orderItems);
            resolve(orderItems)
        })
    },
    getweeklyreport: async () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ status: { $ne: 'cancelled' } }, { status: { $ne: 'pending' } }],
                        createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                { $group: { _id: { $dayOfYear: '$createdAt' }, count: { $sum: 1 } } },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            // console.log(salesOfLastWeekData);
            resolve(salesOfLastWeekData)

        })
    },
    getUsersCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.USER_COLLECTION).find({}).count()
            resolve(count)

        })
    },
    getOrdersCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.ORDER_COLLECTION).find({}).count()
            resolve(count)

        })
    },
    getTotalRevenue: () => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { $and: [{ status: { $ne: 'cancelled' } }, { status: { $ne: 'pending' } }] }
                },
                {
                    $project: {
                        amount: '$amount',
                    }
                },


            ]).toArray()
            let total = 0
            orderItems.forEach((i) => {
                total += (i.amount)
            })
            // console.log("----------------------");
            // console.log(total);
            resolve(total)
        })
    },
    getCodCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentmethod: 'COD' }).count()
            resolve(count)

        })
    },
    getRazorpayCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentmethod: 'RAZORPAY' }).count()
            resolve(count)

        })
    },
    getPaypalCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentmethod: 'PAYPAL' }).count()
            resolve(count)

        })
    },
    getWeeklyUsers: async () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ status: { $ne: false } }],
                        createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                { $group: { _id: { $dayOfYear: '$createdAt' }, count: { $sum: 1 } } },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            resolve(salesOfLastWeekData)

        })
    },
    getDeliverdCount: () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ status: { $eq: 'delivered' } }],
                        createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                { $group: { _id: { $dayOfYear: '$createdAt' }, count: { $sum: 1 } } },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            resolve(salesOfLastWeekData)

        })
    },
    getCancelledCount: () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ status: { $eq: 'cancelled' } }],
                        createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                { $group: { _id: { $dayOfYear: '$createdAt' }, count: { $sum: 1 } } },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            resolve(salesOfLastWeekData)

        })
    },
    getPlacedCount: () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        $and: [{ status: { $eq: 'placed' } }],
                        createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                { $group: { _id: { $dayOfYear: '$createdAt' }, count: { $sum: 1 } } },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            resolve(salesOfLastWeekData)

        })
    },
    getSalesReport: (from, to) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {

                        createdAt: { $gte: new Date(from), $lte: new Date(to) }
                    }
                },
            ]).toArray()
            resolve(orders)
            // console.log(orders);
        })
    },
    salesretailandvetdogs: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).find({ $and: [{ category: { $eq: 'dog' } }, { type: { $eq: 'retailandvet' } }] }).count()
            resolve(count)

        })
    },
    salesretailandvetcats: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).find({ $and: [{ category: { $eq: 'cat' } }, { type: { $eq: 'retailandvet' } }] }).count()
            resolve(count)

        })
    },
    accessoriescats: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).find({ $and: [{ category: { $eq: 'cat' } }, { type: { $eq: 'accessories' } }] }).count()
            resolve(count)

        })
    },
    accessoriesdogs: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).find({ $and: [{ category: { $eq: 'dog' } }, { type: { $eq: 'accessories' } }] }).count()
            resolve(count)

        })
    },
    getSingleAddress: (userId, addId, add) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ user: ObjectId(userId) }, { address: { $elemMatch: { address: add } } })
            address = address.address.filter((addr) => (addr.address === add))
            // console.log(address);
            resolve(address)
        })

    },
    updateAddress: (userId, addobj, addorg) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ user: ObjectId(userId), address: { $elemMatch: { fullname: addorg.fullname, address: addorg.address, city: addorg.city, place: addorg.place, pincode: addorg.pincode, phone: addorg.phone } } },
                {
                    $pull: { address: addorg }
                },
            ).then(async (response) => {
                await userHelpers.addAddress(userId, addobj)
                // console.log(response);
                resolve(response)
            })
        })
    }

}

