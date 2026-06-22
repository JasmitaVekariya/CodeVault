const mongoose = require("mongoose");
const {Schema} = mongoose;

const issuesSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    repository:{
        type: Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    }
});

const Issue = mongoose.model("Issue", issuesSchema);

module.exports = Issue;