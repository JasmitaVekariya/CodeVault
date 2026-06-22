const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const uri = process.env.MONGO_URI;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
  return client;
}


async function createUserDirect(username, password, email) {
  await connectClient();
  const db = client.db("githubclone");
  const usersCollection = db.collection("users");

  // Check if user already exists
  const existing = await usersCollection.findOne({
    $or: [{ username }, { email }],
  });
  if (existing) throw new Error("User or email already exists");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    username,
    password: hashedPassword,
    email,
    repositories: [],
    followedUsers: [],
    following: [],
    followers: [],
    starredRepos: [],
    profilePicture: "https://example.com/default-profile-picture.png",
    bio: "",
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);
  console.log(`✅ User '${username}' added to MongoDB`);
  return result.insertedId;
}

const signup = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      startRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const { userInit } = require("../controllers/userInit.js");
    await userInit(username);

    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "240h" }
    );
    res.json({token , userId: result.insertedId});
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "240h",
    });
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.params.id;
  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const updateUserProfile = async (req, res) => {
//   const currentID = req.params.id;
//   const { email, password } = req.body;

//   try {
//     await connectClient();
//     const db = client.db("githubclone");
//     const usersCollection = db.collection("users");

//     let updateFields = { email };
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);
//       updateFields.password = hashedPassword;
//     }

//     const result = await usersCollection.findOneAndUpdate(
//       {
//         _id: new ObjectId(currentID),
//       },
//       { $set: updateFields },
//       { returnDocument: "after" }
//     );
//     // if (!result.value) {
//     //   return res.status(404).json({ message: "User not found!" });
//     // }

//     res.send(result.value);
//   } catch (err) {
//     console.error("Error during updating : ", err.message);
//     res.status(500).send("Server error!");
//   }
// };



// const updateUserProfile = async (req, res) => {
//   const currentID = req.params.id;
//   const { bio, profilePicture } = req.body; // only accept bio and profilePicture

//   try {
//     await connectClient();
//     const db = client.db("githubclone");
//     const usersCollection = db.collection("users");

//     // Prepare fields to update
//     const updateFields = {};
//     if (bio !== undefined) updateFields.bio = bio;
//     if (profilePicture) updateFields.profilePicture = profilePicture;

//     const result = await usersCollection.findOneAndUpdate(
//       { _id: new ObjectId(currentID) },
//       { $set: updateFields },
//       { returnDocument: "after" }
//     );

//     if (!result.value) {
//       return res.status(404).json({ message: "User not found!" });
//     }

//     res.json(result.value);
//   } catch (err) {
//     console.error("Error during updating : ", err.message);
//     res.status(500).send("Server error!");
//   }
// };


const { updateUserFolder } = require("../controllers/updateUser.js");

const updateUserProfile = async (req, res) => {
  const currentID = req.params.id;
  const { bio, profilePicture, username } = req.body; // include username

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    // Find current user first (to get old username)
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(currentID) });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Prepare fields to update
    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    if (username) updateFields.username = username;

    // Update DB
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(currentID) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    // If username changed, rename local + S3 folders
    if (username && username !== existingUser.username) {
      await updateUserFolder(existingUser.username, username);
    }

    res.json(result.value);
  } catch (err) {
    console.error("Error during updating:", err.message);
    res.status(500).send("Server error!");
  }
};


const followUser = async (req, res) => {
  const { currentUserId, targetUserId } = req.body;

  if (!ObjectId.isValid(currentUserId) || !ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const currentUser = await usersCollection.findOne({ _id: new ObjectId(currentUserId) });
    const targetUser = await usersCollection.findOne({ _id: new ObjectId(targetUserId) });

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let isFollowing = false;

    if (currentUser.following?.includes(targetUserId)) {
      // Unfollow
      await usersCollection.updateOne(
        { _id: new ObjectId(currentUserId) },
        { $pull: { following: targetUserId } }
      );
      await usersCollection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $pull: { followers: currentUserId } }
      );
    } else {
      // Follow
      await usersCollection.updateOne(
        { _id: new ObjectId(currentUserId) },
        { $addToSet: { following: targetUserId } }
      );
      await usersCollection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $addToSet: { followers: currentUserId } }
      );
      isFollowing = true;
    }

    const updatedTarget = await usersCollection.findOne(
      { _id: new ObjectId(targetUserId) },
      { projection: { password: 0 } }
    );

    res.json({
      message: isFollowing ? "Followed user" : "Unfollowed user",
      followersCount: updatedTarget.followers?.length || 0,
      isFollowing,
    });
  } catch (err) {
    console.error("Error following user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const deleteUserProfile = async (req, res) => {
//   const userId = req.params.id;

//   if (!ObjectId.isValid(userId)) {
//     return res.status(400).json({ message: "Invalid user ID format" });
//   }

//   try {
//     await connectClient();
//     const db = client.db("githubclone");
//     const usersCollection = db.collection("users");

//     const result = await usersCollection.deleteOne({
//       _id: new ObjectId(userId),
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
  
// };


const { deleteUserFolder } = require("../controllers/deleteUser.js");

const deleteUserProfile = async (req, res) => {
  const userId = req.params.id;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    // Find user first to get username
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Delete user folder (local + AWS)
    await deleteUserFolder(existingUser.username);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleStarRepo = async (req, res) => {
  try {
    const { userId, repoId } = req.body;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(repoId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");
    const reposCollection = db.collection("repositories");

    // Find user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    let isStarred;

    if (user.starredRepos && user.starredRepos.includes(repoId)) {
      // remove repo from starredRepos
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { starredRepos: repoId } }
      );
      isStarred = false;
    } else {
      // add repo to starredRepos
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { starredRepos: repoId } }
      );
      isStarred = true;
    }

    // ✅ Recalculate stars count from users collection
    const starCount = await usersCollection.countDocuments({
      starredRepos: repoId,
    });

    // ✅ Update repository with exact count
    await reposCollection.updateOne(
      { _id: new ObjectId(repoId) },
      { $set: { stars: starCount } }
    );

    // Get updated repo
    const repo = await reposCollection.findOne({ _id: new ObjectId(repoId) });

    res.json({
      message: "Star status updated",
      isStarred,
      stars: repo?.stars || 0,
    });
  } catch (err) {
    console.error("Error toggling star:", err);
    res.status(500).json({ message: "Error toggling star", error: err.message });
  }
};


// Get starred repos
const getStarredRepos = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");
    const reposCollection = db.collection("repositories");

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: "User not found" });

   const starredReposIds = user.starredRepos || [];


    // fetch repo documents
    const starredRepos = await reposCollection
      .find({ _id: { $in: starredReposIds.map((id) => new ObjectId(id)) } })
      .toArray();

    res.json({ starredRepos });
  } catch (err) {
    console.error("Error fetching starred repos:", err);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  getAllUsers,
  createUserDirect,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  toggleStarRepo,
  getStarredRepos,
   followUser
};
