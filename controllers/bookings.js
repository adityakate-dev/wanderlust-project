const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

const activeStatuses = ["pending", "confirmed"];

function bookingDates(checkIn, checkOut) {
    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end <= start) {
        throw new ExpressError(400, "Choose a valid check-in and check-out date.");
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (start < today) throw new ExpressError(400, "Check-in must be today or later.");
    return { start, end };
}

module.exports.create = async (req, res) => {
    if (!req.body.booking) throw new ExpressError(400, "Send valid booking information");
    const { checkIn, checkOut, guests } = req.body.booking;
    const { start, end } = bookingDates(checkIn, checkOut);
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found");
    if (listing.owner.equals(req.user._id)) throw new ExpressError(400, "You cannot book your own listing.");

    const overlap = await Booking.exists({
        listing: listing._id,
        status: { $in: activeStatuses },
        checkIn: { $lt: end },
        checkOut: { $gt: start },
    });
    if (overlap) {
        req.flash("error", "Those dates are no longer available. Please choose different dates.");
        return res.redirect(`/listings/${listing._id}`);
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const booking = new Booking({
        listing: listing._id,
        guest: req.user._id,
        checkIn: start,
        checkOut: end,
        guests,
        totalPrice: nights * listing.price,
    });
    await booking.save();
    req.flash("success", "Booking request sent to the host!");
    res.redirect("/bookings");
};

module.exports.index = async (req, res) => {
    const guestBookings = await Booking.find({ guest: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });
    const ownedListings = await Listing.find({ owner: req.user._id }).select("_id");
    const hostBookings = await Booking.find({ listing: { $in: ownedListings.map((listing) => listing._id) } })
        .populate("listing")
        .populate("guest", "username email")
        .sort({ createdAt: -1 });

    res.render("bookings/index", {
        guestBookings,
        hostBookings,
    });
};

module.exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    if (!["confirmed", "declined"].includes(status)) throw new ExpressError(400, "Invalid booking status");

    const booking = await Booking.findById(req.params.id).populate("listing");
    if (!booking || !booking.listing) throw new ExpressError(404, "Booking not found");
    if (!booking.listing.owner.equals(req.user._id)) throw new ExpressError(403, "Only the host can manage this booking");
    if (booking.status !== "pending") throw new ExpressError(400, "Only pending requests can be updated");

    if (status === "confirmed") {
        const overlap = await Booking.exists({
            _id: { $ne: booking._id },
            listing: booking.listing._id,
            status: "confirmed",
            checkIn: { $lt: booking.checkOut },
            checkOut: { $gt: booking.checkIn },
        });
        if (overlap) throw new ExpressError(409, "These dates have already been confirmed for another guest");
    }

    booking.status = status;
    await booking.save();
    req.flash("success", `Booking ${status}.`);
    res.redirect("/bookings");
};

module.exports.cancel = async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ExpressError(404, "Booking not found");
    if (!booking.guest.equals(req.user._id)) throw new ExpressError(403, "Only the guest can cancel this booking");
    if (!["pending", "confirmed"].includes(booking.status)) throw new ExpressError(400, "This booking cannot be cancelled");

    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Booking cancelled.");
    res.redirect("/bookings");
};
