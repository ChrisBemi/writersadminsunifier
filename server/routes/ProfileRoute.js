
const router = require("express").Router()

const ProfileController = require("../controllers/ProfileController")








router.post('/:userId/update/name',ProfileController.updateUserNames)





module.exports = router
