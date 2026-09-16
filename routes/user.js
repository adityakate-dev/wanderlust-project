const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users.js");
const profileController = require("../controllers/profiles.js");
const { isLoggedIn } = require("../middleware");

router 
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router 
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}), userController.login);

router.get("/logout", userController.logout);

router
    .route("/profile")
    .get(isLoggedIn, wrapAsync(profileController.myProfile))
    .put(isLoggedIn, wrapAsync(profileController.updateProfile));

router.get("/users/:id", wrapAsync(profileController.showProfile));

module.exports = router;
