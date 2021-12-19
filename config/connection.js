const mongoClient = require('mongodb').MongoClient
require('dotenv').config()

const state = {
    db: null
}
module.exports.connect = (done) => {
    const connection_url = process.env.MONGO_CLIENT
    const dbname = 'ecommerce'

    mongoClient.connect(connection_url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()

    })
}

module.exports.get = function () {
    return state.db
}