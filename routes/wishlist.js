const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const wishlistController = require("../controllers/wishlists");

router.get("/", isLoggedIn, wrapAsync(wishlistController.index));
router.post("/", isLoggedIn, wrapAsync(wishlistController.create));
router.get("/:id", isLoggedIn, wrapAsync(wishlistController.show));
router.post("/:id/listings", isLoggedIn, wrapAsync(wishlistController.addListing));
router.delete("/:id/listings/:listingId", isLoggedIn, wrapAsync(wishlistController.removeListing));
router.delete("/:id", isLoggedIn, wrapAsync(wishlistController.destroy));

module.exports = router;
