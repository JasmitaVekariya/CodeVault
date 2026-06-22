const mongoose = require("mongoose");
const {Schema} = mongoose;

const RepositorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    stars: {
      type: Number,
      default: 0,
    },
    content: [{
        type: String,
    }],
    visibility:{
        type: Boolean,
    },
    issues: [{
        type: Schema.Types.ObjectId,
        ref: "Issue",}]

});

// Add compound unique index for owner + name combination
RepositorySchema.index({ owner: 1, name: 1 }, { unique: true });

const Repository = mongoose.model("Repository", RepositorySchema);

module.exports = Repository;