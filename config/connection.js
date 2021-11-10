const mongoClient = require('mongodb').MongoClient

const state = {
    db: null
}
module.exports.connect = (done) => {
    const connection_url = 'mongodb+srv://rahul:12345@cluster0.6xw0g.mongodb.net/test'
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