const Wishlist = require("../models/wishlist");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

module.exports.index = async (req, res) => {
    const wishlists = await Wishlist.find({ owner: req.user._id })
        .populate("listings")
        .sort({ updatedAt: -1 });
    res.render("wishlists/index", { wishlists });
};

module.exports.create = async (req, res) => {
    const { name, description, listingId } = req.body;
    const wishlist = new Wishlist({ name, description, owner: req.user._id });

    if (listingId) {
        const listing = await Listing.findById(listingId);
        if (!listing) throw new ExpressError(404, "Listing not found");
        wishlist.listings.push(listing._id);
    }

    await wishlist.save();
    req.flash("success", "Wishlist created!");
    res.redirect(listingId ? `/listings/${listingId}` : "/wishlists");
};

module.exports.show = async (req, res) => {
    const wishlist = await Wishlist.findById(req.params.id).populate("listings");
    if (!wishlist) throw new ExpressError(404, "Wishlist not found");
    if (!wishlist.owner.equals(req.user._id)) throw new ExpressError(403, "You cannot view this wishlist");
    res.render("wishlists/show", { wishlist });
};

module.exports.addListing = async (req, res) => {
    const { id } = req.params;
    const { listingId } = req.body;
    const wishlist = await Wishlist.findById(id);
    const listing = await Listing.findById(listingId);

    if (!wishlist || !listing) throw new ExpressError(404, "Wishlist or listing not found");
    if (!wishlist.owner.equals(req.user._id)) throw new ExpressError(403, "You cannot edit this wishlist");

    if (!wishlist.listings.some((savedId) => savedId.equals(listing._id))) {
        wishlist.listings.push(listing._id);
        await wishlist.save();
        req.flash("success", "Listing saved to your wishlist!");
    } else {
        req.flash("error", "That listing is already in this wishlist.");
    }
    res.redirect(`/listings/${listing._id}`);
};

module.exports.removeListing = async (req, res) => {
    const { id, listingId } = req.params;
    const wishlist = await Wishlist.findById(id);
    if (!wishlist) throw new ExpressError(404, "Wishlist not found");
    if (!wishlist.owner.equals(req.user._id)) throw new ExpressError(403, "You cannot edit this wishlist");

    wishlist.listings.pull(listingId);
    await wishlist.save();
    req.flash("success", "Listing removed from wishlist.");
    res.redirect(`/wishlists/${id}`);
};

module.exports.destroy = async (req, res) => {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) throw new ExpressError(404, "Wishlist not found");
    if (!wishlist.owner.equals(req.user._id)) throw new ExpressError(403, "You cannot delete this wishlist");

    await wishlist.deleteOne();
    req.flash("success", "Wishlist deleted.");
    res.redirect("/wishlists");
};
