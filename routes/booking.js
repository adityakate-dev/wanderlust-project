const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

router.get("/", isLoggedIn, wrapAsync(bookingController.index));
router.put("/:id/status", isLoggedIn, wrapAsync(bookingController.updateStatus));
router.put("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancel));

module.exports = router;
