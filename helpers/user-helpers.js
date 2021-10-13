var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
// const { ObjectId } = require('bson')
var objectId = require('mongodb').ObjectId
// const { response } = require('express')
const { ObjectId } = require('bson')
const { response } = require('express')
const { PRODUCT_COLLECTION } = require('../config/collections')
module.exports = {
    userSignup: async (userData) => {
        userData.status = true
        userData.password = await bcrypt.hash(userData.password, 10)
        return await db.get().collection(collection.USER_COLLECTION).insertOne(userData)
    },
    adminLogin: async (adminData) => {
        let loginstatus = false
        let response = {}
        let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ username: adminData.username })
        if (admin) {
            const status = await bcrypt.compare(adminData.password, admin.password)
            if (status) {
                console.log("Admin login success");
                return { admin, status }

            } else {
                console.log("Admin login failed");
                return null
            }

        } else {
            console.log("Admin login failed");
            return null
        }

    },
    userLogin: async (userData) => {
        let loginstatus = false
        let response = {}
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ username: userData.username })

        if (user && user.status) {

            const status = await bcrypt.compare(userData.password, user.password)
            if (status) {
                console.log("User login success");
                return { user, status }
            } else {
                console.log("User login failed");
                return null
            }

        } else {
            console.log("User login failed blocked");
            return null
        }

    },
    usersDetails: () => {
        return new Promise(async (resolve, reject) => {
            let newusers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(newusers)
        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, [{ $set: { status: false } }]).then((response) => {
                resolve(response);
            })
        })
    },
    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, [{ $set: { status: true } }]).then((response) => {
                resolve()
            })
        })
    },
    addtoBag: (prodId, userId) => {
        let proObj = {
            item: ObjectId(prodId),
            quantity: 1

        }
        return new Promise(async (resolve, reject) => {
            let userBag = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userBag) {
                let proExist = userBag.products.findIndex(product => product.item == prodId)
                console.log(proExist);
                if (proExist != -1) {
                    console.log("keriiii");
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'products.item': ObjectId(prodId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                        {

                            $push: { products: proObj }

                        }
                    ).then((response) => {
                        resolve()
                    })
                }


            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getMybag: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
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
                }
            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },
    getBagcount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeQuantity: (prodDetails) => {
        // console.log(prodDetails.cart, prodDetails.product, prodDetails.count);
        prodDetails.count = parseInt(prodDetails.count)
        prodDetails.quantity = parseInt(prodDetails.quantity)

        return new Promise((resolve, reject) => {
            if (prodDetails.count == -1 && prodDetails.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(prodDetails.cart) },
                    {
                        $pull: { products: { item: ObjectId(prodDetails.product) } }
                    }
                ).then((response) => {
                    // console.log(response);
                    resolve({ removeProduct: true })
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(prodDetails.cart), 'products.item': ObjectId(prodDetails.product) },
                    {
                        $inc: { 'products.$.quantity': prodDetails.count }
                    }
                ).then((response) => {
                    // console.log(response);
                    resolve(true)
                })
            }

        })
    },
    deletebagItem: async (cartDetails) => {
        // console.log(cartDetails.cart, cartDetails.product);
        let itemDetails = await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartDetails.cart) },
            {
                $pull: { products: { item: ObjectId(cartDetails.product) } }
            }
        )
        return { deleteItem: true }
    }

}