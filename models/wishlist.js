const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        listings: [
            {
                type: Schema.Types.ObjectId,
                ref: "Listing",
            },
        ],
    },
    { timestamps: true }
);

wishlistSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
