const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 300,
        default: ""
    },
    profileImage: {
        type: String,
        trim: true,
        default: ""
    }
});

userSchema.plugin(passportLocalMongoose); //It is used to add hashing, salting automatically

module.exports = mongoose.model("User", userSchema);
