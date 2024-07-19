const router = require("express").Router();


const WithdrawalController = require("../controllers/WithdrawalController");


router.post('/:writerId/request/withdrawal',WithdrawalController.requestWithDrawal)



router.get('/get',WithdrawalController.getWithDrawals)

router.get('/get/:writerId',WithdrawalController.getWithDrawalsById)

router.delete('/:withdrawalId/delete',WithdrawalController.clearWithDrawal)





module.exports = router;