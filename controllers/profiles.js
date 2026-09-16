const User = require("../models/user");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

module.exports.myProfile = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id }).sort({ _id: -1 });
    res.render("users/profile", { profileUser: req.user, isOwner: true, listings });
};

module.exports.updateProfile = async (req, res) => {
    const { bio, profileImage } = req.body;
    req.user.bio = bio || "";
    req.user.profileImage = profileImage || "";
    await req.user.save();
    req.flash("success", "Profile updated!");
    res.redirect("/profile");
};

module.exports.showProfile = async (req, res) => {
    const profileUser = await User.findById(req.params.id);
    if (!profileUser) throw new ExpressError(404, "User not found");
    const listings = await Listing.find({ owner: profileUser._id }).sort({ _id: -1 });
    const isOwner = req.user && req.user._id.equals(profileUser._id);
    res.render("users/profile", { profileUser, isOwner, listings });
};
