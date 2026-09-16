const Listing = require("../models/listing");
const axios = require("axios");
const Wishlist = require("../models/wishlist");
const Booking = require("../models/booking");


module.exports.index = async (req, res) => {
    const  allListings =  await Listing.find({});
    res.render("listings/index", {allListings} );
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    if (!listing.image || !listing.image.url) {
        listing.image = {
            url: "https://placehold.co/600x400/png?text=Default+Image",
            filename: "default-image"
        };
    }
    console.log(listing);
    if (!listing.geometry) {
    // Default to New Delhi
        listing.geometry = {
            type: "Point",
            coordinates: [77.2090, 28.6139]
        };
    }
    const wishlists = req.user
        ? await Wishlist.find({ owner: req.user._id }).select("name listings")
        : [];
    const unavailableBookings = await Booking.find({
        listing: listing._id,
        status: { $in: ["pending", "confirmed"] },
    }).select("checkIn checkOut");
    res.render("listings/show", {
        listing,
        wishlists,
        unavailableBookings,
        mapToken: process.env.MAPTILER_KEY,
        listingCoords: listing.geometry ? listing.geometry.coordinates : [77.2090, 28.6139] // fallback
    });


};

module.exports.createListing = async(req, res, next) => {
    const listing = req.body.listing;
    let coordinates;

    // 1️⃣ Geocode only if location provided
    if (listing.location && listing.location.trim() !== "") {
        try {
            const geoResponse = await axios.get(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(listing.location)}.json`,
                { params: { key: process.env.MAPTILER_KEY } }
            );

            if (geoResponse.data.features.length > 0) {
                coordinates = geoResponse.data.features[0].geometry.coordinates;
            } else {
                coordinates = [77.2090, 28.6139]; // fallback New Delhi
            }
        } catch (err) {
            console.log("Geocoding failed, defaulting to New Delhi", err);
            coordinates = [77.2090, 28.6139]; // fallback
        }
    } else {
        coordinates = [77.2090, 28.6139]; // fallback if empty
    }

    // 2️⃣ Handle optional image
    const url = req.file ? req.file.path : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800";
    const filename = req.file ? req.file.filename : "default-image";
    if (!listing.image || !listing.image.url) {
        listing.image = { url, filename };
    }

    // 3️⃣ Create new listing
    const newListing = new Listing(listing);
    newListing.geometry = { type: "Point", coordinates };
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit", { listing, originalImageUrl});
};

module.exports.updateListing = async(req, res) => {
    if(!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Update basic fields
    listing.set(req.body.listing);

    // Re-geocode if location changed
    if (req.body.listing.location && req.body.listing.location.trim() !== "") {
        try {
            const geoResponse = await axios.get(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json`,
                { params: { key: process.env.MAPTILER_KEY } }
            );

            if (geoResponse.data.features.length > 0) {
                listing.geometry.coordinates = geoResponse.data.features[0].geometry.coordinates;
            }
        } catch(err) {
            console.log("Geocoding failed, keeping old coordinates", err);
        }
    }

    // Update image if new uploaded
    if (req.file) {
        listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req, res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
