const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    // Timestamp:true,
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    repositories: [{
        type: Schema.Types.ObjectId,
        default: [],
        ref: "Repository"
    }],
    // follwedUsers: [{
    //     type: Schema.Types.ObjectId,
    //     ref: "User"
    // }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],

  followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
     starredRepos: [  
    {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: [],
    },
  ],
    profilePicture: {
        type: String,
        default: "https://example.com/default-profile-picture.png"
    },
    bio: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    
}
);

const User = mongoose.model("User", userSchema);

module.exports = User;