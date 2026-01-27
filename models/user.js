const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
});

userSchema.plugin(passportLocalMongoose); //It is used to add hashing, salting automatically

module.exports = mongoose.model("User", userSchema);
