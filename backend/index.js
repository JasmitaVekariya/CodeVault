#!/usr/bin/env node

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router.js"); 

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init.js"); // Importing the initRepo function from the init.js file in controllers directory
const { addRepo } = require("./controllers/add.js");
const { pullRepo } = require("./controllers/pull.js");
const { pushRepo } = require("./controllers/push.js");
const { commitRepo } = require("./controllers/commit.js");
const { revertRepo } = require("./controllers/revert.js");
const { userInit } = require("./controllers/userInit.js");

dotenv.config();

yargs(hideBin(process.argv))
  .command("start", "Start a new server", {}, startServer) // This will call the startServer function when the 'start' command is used
  .command("userInit <user> <pass> <email>",
    "Initialize a user in .github_clone on S3",
    (yargs) => {
      yargs.positional("user", {
        describe: "User name",
        type: "string",
      });
      yargs.positional("pass", {
        describe: "password",
        type: "string",
      });
      yargs.positional("email", {
        describe: "email address",
        type: "string",
      });
    },
    (argv) => userInit(argv.user, argv.pass, argv.email)
  )
  .command("init <user> <repo>", "Initialise a new repository", (yargs) => {
    yargs.positional("repo", {
      describe: "Repo name",
      type: "string",
    });
    yargs.positional("user", {
      describe: "user name",
      type: "string",
    });
  }, 
  (argv) => {
    initRepo(argv.user, argv.repo);
  }
  )
  .command(
    "add <user> <repo> <file>",
    "Add a new repository",
    (yargs) => {
      yargs.positional("repo", {
        describe: "repo name",
        type: "string",
      });
      yargs.positional("file", {
        describe: "File to add",
        type: "string",
      });
      yargs.positional("user", {
        describe: "user name",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.user, argv.repo, argv.file);
    }
  ) // This will call the addRepo function with the file argument
  .command(
    "commit <user> <repo> <message>",
    "commit a repository",
    (yargs) => {
      yargs.positional("repo", {
        describe: "repo name",
        type: "string",
      });
      yargs.positional("message", {
        describe: "commit message",
        type: "string",
      });
      yargs.positional("user", {
        describe: "user name",
        type: "string",
      });
    },
    (argv) => commitRepo(argv.user, argv.repo, argv.message)
  ) // This will call the commitRepo function with the message argument
  .command(
    "pull <user> <repo>", 
    "pull a repository", 
    (yargs) => {
      yargs.positional("repo", {
        describe: "repo name",
        type: "string",
      });
      yargs.positional("user", {
        describe: "user name",
        type: "string",
      });
    },
    (argv) => pullRepo(argv.user, argv.repo) 
  )
  .command(
    "push <user> <repo>", 
    "push a repository", 
    (yargs) => {
      yargs.positional("repo", {
        describe: "repo name",
        type: "string",
      });
      yargs.positional("user", {
        describe: "user name",
        type: "string",
      });
    },
    (argv) => pushRepo(argv.user, argv.repo) 
  )
  .command(
    "revert <user> <repo> <commit_id>",
    "revert a command",
    (yargs) => {
      yargs.positional("repo", {
        describe: "repo name",
        type: "string",
      });
      yargs.positional("commit_id", {
        describe: "commit id to revert to",
        type: "string",
      });
      yargs.positional("user", {
        describe: "user name",
        type: "string",
      });
    },
    (argv) => revertRepo(argv.user, argv.repo, argv.commit_id)
  )
  .demandCommand(1, "You must provide a command")
  .help().argv;
//arg Which come from terminal is fetched by process.argv and hidebin is used to hide the first two arguments which are not required
// command is used to define a command with its description when help runs

function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;


  // app.use(cors({ origin: "*" }));

  app.use(cors({
    origin: "http://localhost:5173", // your React app URL
    credentials: true
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use("/", mainRouter); 

  const mongoURI = process.env.MONGO_URI;

  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });

    const user = "test";

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });
    
    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            user = userID;
            console.log(`User ${userID} has joined the room`);
            socket.join(userID);
        })
    });

    const db = mongoose.connection;
    db.once("open", async() => {
      console.log("Crud operations are ready to be performed");
    });

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

}
