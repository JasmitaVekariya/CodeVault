# CodeVault: Library Dependencies & Backend Internals Reference

This reference guide lists the npm libraries used in CodeVault, how they are utilized, and explains key Node.js/Express internals that are high-priority topics for technical interviews.

---

## 1. NPM Dependencies & Usage in CodeVault

Here is the complete mapping of dependencies found in the project's [package.json](file:///Users/apple/Jasmita_Vekariya/Sem%205/AT/CodeVault/backend/package.json), detailing why they were chosen, which functions are invoked, and how they function.

| Dependency | Scope & Purpose in CodeVault | Key Functions Used | How It Works Internally |
| :--- | :--- | :--- | :--- |
| **`express`** | Web framework powering the HTTP JSON APIs. | `express()`, `express.Router()`, `app.use()`, `res.json()`, `res.status()`, `req.params`, `req.headers` | Operates an HTTP server wrapping Node's native `http` module. Manages a stack of middleware functions and handles routing matching. |
| **`mongoose`** | MongoDB ODM (Object Document Mapper) for structured schemas. | `mongoose.connect()`, `new mongoose.Schema()`, `mongoose.model()`, `Model.findOne()`, `Model.findById()`, `.populate()`, `save()` | Translates MongoDB documents into JavaScript objects. Caches database connection sockets, casts variables into specific schema types, and manages population joins. |
| **`mongodb`** | Low-level native driver for MongoDB (used in userController for direct queries). | `new MongoClient()`, `client.connect()`, `db.collection()`, `collection.insertOne()`, `collection.findOne()`, `ObjectId` | Communicates directly with the database using the BSON protocol. Faster and more direct than Mongoose for custom scripts or simple operations. |
| **`aws-sdk`** | AWS SDK v2, used to upload, retrieve, and list files on S3. | `new AWS.S3()`, `s3.putObject().promise()`, `s3.upload().promise()`, `s3.getObject().promise()`, `s3.listObjectsV2().promise()` | Wraps AWS S3 REST API calls into Node.js HTTP/HTTPS requests. Employs `.promise()` to convert standard callback-based SDK methods into modern async/await promises. |
| **`@aws-sdk/client-s3`** | AWS SDK v3 (installed for S3 interactions, though v2 is heavily used in config). | N/A (Project standardizes on S3 v2 mock/wrapper in config) | Introduces modularity and smaller bundle sizes by allowing developers to import only specific clients (e.g., S3) rather than the whole SDK. |
| **`multer`** | Middleware for parsing `multipart/form-data` request bodies (uploads). | `multer({ dest: "uploads/" })`, `upload.array("files")` | Intercepts streaming files in the request stream, writes them to chunks, and outputs files into a local folder (`uploads/`) while adding metadata to `req.files`. |
| **`archiver`** | Utility to compress files into ZIP format on the fly. | `archiver("zip", { zlib })`, `archive.pipe()`, `archive.append()`, `archive.finalize()` | Implements a Node write stream. Writes incoming file buffers or read streams into a compressed zip format in real-time, avoiding full file buffering in RAM. |
| **`bcryptjs`** | Hashing library for securing user passwords. | `bcrypt.genSalt()`, `bcrypt.hash()`, `bcrypt.compare()` | A pure-JavaScript implementation of the bcrypt password-hashing function. Uses blowfish encryption and a configurable salt cost factor to slow down brute force attacks. |
| **`jsonwebtoken`** | Implements stateless JWT (JSON Web Tokens) user authentication. | `jwt.sign()`, `jwt.verify()` | Signs payloads (like `userId`) into a cryptographically secured base64 string using a server-side secret key (`JWT_SECRET_KEY`) and an expiration time. |
| **`socket.io`** | WebSockets server for real-time bi-directional events. | `new Server()`, `io.on("connection")`, `socket.on("joinRoom")`, `socket.join()` | Starts by upgrading standard HTTP requests to full TCP WebSocket connections. Uses event emitters to dispatch events to specific virtual channels or rooms. |
| **`yargs`** | Parses command-line inputs to implement CLI actions. | `yargs(hideBin())`, `.command()`, `.positional()`, `.demandCommand()` | Parses terminal inputs (`process.argv`) into key-value options, executes matching command callback handlers, and prints automated `--help` documents. |
| **`uuid`** | Generates globally unique identifier strings (V4) for commits. | `uuidv4()` | Generates cryptographically secure random 128-bit numbers formatted as 36-character hexadecimal strings (e.g., `f47ac10b-58cc-4372-a567-0e02b2c3d479`). |
| **`cors`** | Configures CORS HTTP headers to control cross-origin requests. | `cors({ origin, credentials })` | Automatically appends headers like `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials` to HTTP responses. |
| **`dotenv`** | Loads environment variables from a `.env` file. | `dotenv.config()` | Parses a `.env` file at runtime and injects the keys and values into the Node process container, available via `process.env`. |

---

## 2. Local S3 Mock: A Key Interview Talking Point

A unique design choice in CodeVault is the **Local S3 Mock** ([aws-config.js](file:///Users/apple/Jasmita_Vekariya/Sem%205/AT/CodeVault/backend/config/aws-config.js#L14-L158)). If `process.env.USE_LOCAL_S3` is set to `"true"`, the application bypasses external AWS connectivity and runs an in-memory/on-disk mock.

### How the Mock Emulates S3 APIs:
* **Promises Interface:** AWS SDK v2 calls require `.promise()` to be chained after API calls. The mock emulates this by returning objects with a `promise` method:
  ```javascript
  putObject: (params) => ({
    promise: async () => { ... }
  })
  ```
* **Directory Mirroring:** It translates S3 keys (e.g., `alice/my-repo/commits/123/file.txt`) into local disk paths inside `local_s3_bucket/githubcolnebucket/...` using `fs.mkdir` and `fs.writeFile`.
* **Streaming Support:** To support `downloadLatestCommitAsZip` (which calls `.createReadStream()`), the mock provides a custom `createReadStream()` function that hooks directly into native file streams:
  ```javascript
  getObject: (params) => ({
    promise: async () => ({ Body: await fsPromises.readFile(fullPath) }),
    createReadStream: () => fs.createReadStream(fullPath)
  })
  ```

---

## 3. Crucial Node.js & Express Internals for Interviews

Interviewers testing senior Node.js / Express skills will often ask deep conceptual questions. Below is how the concepts apply directly to the CodeVault codebase.

### Topic A: The Event Loop & Async File I/O
* **Interview Question:** *"Node.js is single-threaded, but you perform heavy filesystem tasks like copying folders and reading databases. How does this not block incoming HTTP requests?"*
* **The Answer:** Node.js executes the main JavaScript code on a single thread. However, asynchronous filesystem methods (`fs.promises` or `fs.copyFile`) and database calls are offloaded to **Libuv’s threadpool** (which defaults to 4 worker threads).
* **CodeVault Context:** When `commitRepo` copies files from a previous commit, Libuv executes these synchronous-like disk operations on background OS threads. Once completed, the callback or resolved promise is placed in the **Microtask Queue**, and the Event Loop picks it up to return the response, keeping the main HTTP event thread unblocked.

### Topic B: Streams and Buffers (Memory Management)
* **Interview Question:** *"If 10 users download a 500MB repository ZIP at the same time, how does your server handle it without crashing due to out-of-memory errors?"*
* **The Answer:** If you read the entire repository into a buffer in memory (`fs.readFile`) before sending it, 10 concurrent requests would consume `10 * 500MB = 5GB` of RAM. To prevent this, CodeVault uses **Streams**.
* **CodeVault Context:** In [downloadController.js](file:///Users/apple/Jasmita_Vekariya/Sem%205/AT/CodeVault/backend/controllers/downloadController.js#L94-L98):
  ```javascript
  const stream = s3.getObject({ Bucket: S3_BUCKET, Key: obj.Key }).createReadStream();
  archive.append(stream, { name: relativePath });
  ```
  This streams chunks of data directly from S3 (source) through the zip compiler into the Express response object (destination). The files are never stored in their entirety in RAM; they are processed as small, continuous packets.

### Topic C: Express Middleware & Chaining Mechanics
* **Interview Question:** *"How does Express chain middlewares together? What happens under the hood when you call `next()`?"*
* **The Answer:** Express routes are stored internally as an array of layer objects containing a matching regex path and a callback function. When a request matches a route, Express iterates through these layers sequentially.
* **CodeVault Context:** For `repoRouter.post("/repo/:user/:repo/add", checkRepositoryOwnership, upload.array("files"), ...)`:
  1. Express calls `checkRepositoryOwnership`.
  2. If validation fails, it halts the chain and sends a response (`res.status(403).json(...)`).
  3. If it succeeds, calling `next()` tells Express to increment its internal layer index counter and execute the next handler in the queue (`upload.array("files")`).
  4. Multer parses the request, appends the files to `req.files`, and calls its internal `next()`, which finally fires the main route controller callback.

### Topic D: CommonJS (`require`) vs ES Modules (`import`)
* **Interview Question:** *"Your project uses `require()` instead of `import`. What are the differences between CommonJS and ES Modules (ESM)?"*
* **The Answer:** 
  1. **Evaluation Time:** CommonJS imports are evaluated **synchronously** at runtime, meaning files are loaded and executed when the `require` statement is hit. ES Modules are analyzed **statically** at compile time before the script runs.
  2. **Caching:** Both cache modules after the first load. However, ESM imports create read-only live bindings to the exported variables, whereas CommonJS copies the exported value (or reference).
  3. **Compatibility:** CommonJS is the legacy module system of Node.js. In CodeVault, `.js` files are treated as CommonJS because `package.json` specifies `"type": "commonjs"`.
