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
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find().toArray().then((newusers) => {
                resolve(newusers)
            })

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
                // console.log(proExist);
                if (proExist != -1) {
                    // console.log("keriiii");
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
                    resolve({ status: true })
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
        // console.log(itemDetails);
        return { deleteItem: true }
    },
    getTotalprice: (userId) => {

        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            let totalPrice = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
                },
                // {
                //     $project: {
                //         total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                //     }
                // },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }
            ]).toArray()
            // console.log(totalPrice[0].total);
            resolve(totalPrice[0].total)
        })
    },
    addAddress: (userId, addressDetails) => {
        let address = {
            fullname: addressDetails.fullname,
            address: addressDetails.address,
            city: addressDetails.city,
            place: addressDetails.place,
            pincode: addressDetails.pincode,
            phone: addressDetails.phone
        }

        return new Promise(async (resolve, reject) => {
            let addCollection = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ user: ObjectId(userId) })
            if (addCollection) {
                console.log("vanu");
                db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ user: ObjectId(userId) },
                    {
                        $push: { address: address }
                    }).then((response) => {
                        resolve()
                    })
            } else {
                let addObj = {
                    user: objectId(userId),
                    address: [address]
                }
                await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addObj).then((response) => {
                    resolve()
                })
            }


        })
    },
    getAddress: async (userId) => {

        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$address'
                },
                {
                    $project: {
                        address: '$address',

                    }
                },
                // {
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         localField: 'item',
                //         foreignField: '_id',
                //         as: 'product'
                //     }
                // },
                // {
                //     $project: {
                //         user: 1,
                //         address: { $arrayElemAt: ['$product', 0] }
                //     }
                // }
            ]).toArray()
            console.log(address);
            resolve(address)
        })




    },














    getBagProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            resolve(cart.products)
        })
    },
    placeOrder: (address, products, total, payment) => {
        // console.log(payment);
        return new Promise(async (resolve, reject) => {
            if (payment === 'COD') {
                var status = 'placed'
            } else {
                status = 'pending'
            }
            let order = {
                deliveryaddress: {
                    address: address.address,
                    city: address.city,
                    place: address.place,
                    pincode: address.pincode
                },
                userId: ObjectId(address.user),
                paymentmethod: payment,
                products: products,
                amount: total,
                status: status

            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(order).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(address.user) })
                resolve()
            })

        })
    },
    getSingleprice: (userId) => {

        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            let totalPrice = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
                },
                {
                    $project: {
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } },
                        product: 1,
                    }
                },
                // {
                //     $group: {
                //         _id: null,
                //         total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                //     }
                // }
            ]).toArray()
            // console.log(totalPrice);
            resolve(totalPrice)
        })
    }
}