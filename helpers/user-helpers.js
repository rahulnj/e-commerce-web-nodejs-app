var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                // console.log(data);
                resolve(data)
            })
        })

    },
    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginstatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ username: adminData.username })
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((Status) => {
                    if (Status) {
                        console.log("Admin login success");
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Admin login failed");
                        resolve({ Status: false })
                    }
                })
            } else {
                console.log("Admin login failed");
                resolve({ Status: false })
            }
        })
    },
    userLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginstatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ username: userData.username })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((Status) => {
                    if (Status) {
                        console.log("User login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("User login failed");
                        resolve({ Status: false })
                    }
                })
            } else {
                console.log("User login failed");
                resolve({ Status: false })
            }
        })
    },
    usersDetails: () => {
        return new Promise(async (resolve, reject) => {
            let newusers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(newusers)
        })
    }
}