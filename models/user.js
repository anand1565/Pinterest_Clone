const mongoose = require('mongoose');
const { type } = require('os');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterest_clone")
    .then(() => {
        console.log("Database connected successfully")
    }).catch((err) => {
        console.log(err);
    })

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    contact: {
        type: Number,
        required: true
    },
    name: {
        type: String,
    },
    profileImage: {
        type: String,
    },
    boards: {
        type: Array,
        default: []
    },
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post"
        }
    ]

})

userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);
