var db = require('../config/connection')
var collection = require('../config/collections')


module.exports = {
    addProduct: async (product) => {

        let data = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
        return data.insertedId
    },

    getProducts: async (product) => {
        let proDetails = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        // console.log(proDetails);
        return proDetails
    }
}

