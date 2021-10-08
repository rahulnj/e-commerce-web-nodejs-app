var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('bson')

module.exports = {
    addProduct: async (product) => {

        let data = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
        return data.insertedId
    },

    getProducts: async (product) => {
        let proDetails = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        // console.log(proDetails);
        return proDetails
    },
    deleteProducts: async (product) => {
        let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(product) })
        return prodDetails
    },
    editProduct: async (product) => {
        let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(product) })
        return prodDetails
    },
    updateProduct: async (proId, product) => {
        let prodDetails = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) }, {
            $set: {

                product: product.product,
                description: product.description,
                price: product.price,
                quantity: product.quantity
            }
        })
        return prodDetails
    }
}

