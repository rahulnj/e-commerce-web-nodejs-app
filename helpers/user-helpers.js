var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
// const { ObjectId } = require('bson')
var objectId = require('mongodb').ObjectId
const { response } = require('express')
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
    }
}