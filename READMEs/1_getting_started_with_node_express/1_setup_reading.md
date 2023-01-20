# MERN Stack Setup

The principles of building an app in the MERN stack will be familiar to you
given your experience in Rails and JavaScript. However, there are some new
concepts that you will need to familiarize yourself with before you are ready to
build your app. This tutorial will walk you through setting up the skeleton of a
new project. It steps you through building a simple Twitter application using
the MERN stack.

## Skeleton

A skeleton of the finished app is hosted [here][mern-twitter]. Bookmark this
page so that you can refer back it to during the tutorial.

[mern-twitter]: https://github.com/appacademy/practice-for-ch-mern-twitter

## MongoDB Atlas

Before you start creating your backend, set up your database. You will be using
[MongoDB Atlas], which is a free service (at the basic tier) allowing you to
host your database online. Follow these steps to set up your database:

* Go to the website and create an account.
* Click `Create` for the Free `Shared` tier, which should take you to the
  `Create a Shared Cluster` page.
* Configure your cluster:
  * Select Amazon Web Services (AWS) as your cloud provider.
  * Select the region that is geographically closest to you.
  * Change the `Cluster Name` to `MERN`.
  * Leave everything else as defaults.
* Click the `Create Cluster` button at the bottom of the page.
* On the `Security Quickstart` page, select `Username and Password`.
* Create a new user.
  * Use whatever username you like, e.g., `admin`.
  * Click the `Autogenerate Secure Password` button and save the password for
    later.
  * **DO NOT COMMIT THE PASSWORD.**
* Under `Where would you like to connect from?`, select `My Local Environment`.
* Add the IP address `0.0.0.0/0` to allow connections from any IP.
* Click `Finish and Close`.
* Click `Go to Databases`.
* Find your cluster (probably `Cluster0` or, if you changed the name as
  suggested above, `MERN`) and click `Connect`.
* Select `Connect your application`.
* Copy the connection string and paste it somewhere where you can save it
  without its being committed.
* Replace the `<password>` in the connection string with the auto-generated
  password for the user you created earlier.

[MongoDB Atlas]: https://www.mongodb.com/cloud/atlas?jmp=docs

## Basic Setup

To start:

* Create a __mern-twitter__ folder for your application and open it with VS
  Code.
* Create a new folder inside __mern-twitter__ named __backend__.
* In the terminal, `cd` into __backend__ and run `npm init -y` to create a
  __package.json__ with the standard defaults in the __backend__ directory.
* Open the resulting __package.json__.

A __package.json__ file is similar to a __Gemfile__ file in Ruby.

Fill in the `"description"`--something like "Backend for a Twitter clone built
with the MERN stack" would be appropriate--and author. Under the `"main"` key,
specify __bin/www__ as your entry point.

### Installing dependencies

You can install a Node.js dependency (also called a node module) by running `npm
install <dependency>`. Rather than installing them one at a time, you can type
`npm install <dependency1> <dependency2> <dependency3> ...`. Your project will
likely require some unique dependencies.

You will use a starter generator to create the initial Express application,
similarly to the way `rails new` generates a new Rails application. To install
the generator, run `npm install express-generator`.

You should now see the `express-generator` and its version number in the
__package.json__ file under the `"dependencies"` key. You should also see one
new file and one new folder in the project directory. The __package-lock.json__
is similar to a __Gemfile.lock__ in Ruby. The generated __node_modules/__ folder
holds all the dependencies and their files downloaded from [npmjs.com], which is
the premier hosting site for all public Node.js dependencies.

Run the `express-generator` dependency with `npx express-generator --no-view
--force` to initialize the Express application without an HTML template engine
(`--no-view`).

This should create the following folder structure:

```plaintext
mern-twitter
└── backend
    ├── bin
    │   └── www
    ├── public
    │   ├── images
    │   ├── index.html
    │   ├── javascripts
    │   └── stylesheets
    │       └── style.css
    ├── routes
    │   ├── index.js
    │   └── users.js
    ├── app.js
    ├── package-lock.json
    └── package.json
```

Now you can remove the `express-generator` dependency since you only needed it
to generate the Express starter files. Run `npm uninstall express-generator` to
remove it from your __package.json__.

You may have noticed that `express-generator` installed the following
dependencies in your __package.json__ file:

* `cookie-parser` - an Express middleware that extracts the cookies from the
  request
* `debug` - replaces `console.log` for better error reporting and logging
* `express` - the main backend framework
* `morgan` - an Express middleware that will log important request information
  (like the `method`/`URL` of an incoming request)

Install the following dependencies (remember, you can use `npm install
<dependency1> <dependency2> <dependency3> ...` to install multiple
dependencies):

* `bcryptjs` - similar to the BCrypt gem in Ruby
* `express-validator` - for request body (i.e., user input) validations
* `cors` - CORS (Cross-Origin Resource Sharing)
* `csurf` - for CSRF protection
* `jsonwebtoken` - to generate the JSON web tokens (JWTs)
* `mongoose` - to connect and interact with MongoDB (the database of this stack)
* `passport` - for authentication
* `passport-jwt` - to use JSON web tokens (JWTs) as an authentication method
* `passport-local` - to use a username/password combination as an authentication
  method

Let's also install 2 development dependencies, `dotenv-cli` and `nodemon`, by
running `npm install -D dotenv-cli nodemon`:

* `dotenv-cli` - loads environment variables from a __.env__ file; the `cli`
  version enables you to run `dotenv` from the command line / npm script (as
  opposed to within your code)
* `nodemon` - aliases the `node` command but also restarts the server whenever
  there is a server file change

Take a look at your __package.json__. You will notice that the development
dependencies have been added to this file under the `"devDependencies"` key.

[npmjs.com]: https://www.npmjs.com/

### Scripts

You can define custom scripts under the `"scripts"` key in the __package.json__
file to document and easily run commands that you will use in your application,
such as starting your server.

Open __package.json__ and find the following line:

```js
"scripts": {
  "start": "node ./bin/www"
}
```

The `start` script will run the __bin/www__ file in Node.js. This will start the
server. Run `npm run start` or simply `npm start` to start the server. (The
starter project will start the server on port `3000` by default.)

Navigate to [http://localhost:3000] in your browser. You should see a "Welcome
to Express" message on the webpage!

Go to [http://localhost:3000/users]. You should see `respond with a resource` in
the browser window. This message is coming from __routes/users.js__. Pull up
that file and change the message passed to `res.send` to `Respond with a user
resource`.  Refresh the webpage. Did the webpage change?

Try restarting the server to see the changes. Type `CTRL+C` in the terminal
where you started the server to stop the server. Then run `npm start` to start
the server again. Now when you refresh the webpage, you should see your changed
message!

This behavior is fine for an application in production, but it's a little
annoying for development purposes to have to restart the server every time
you make a change to the server files. Let's add another script that will
restart the server on any server file change.

Add a `dev` script that will call `nodemon` instead of `node` on the __bin/www__
file.

```json
"scripts": {
  "start": "node ./bin/www",
  "dev": "nodemon ./bin/www --inspect"
}
```

Stop the server again and restart it with `npm run dev`. Now the node monitor
will restart the server whenever a critical file in the project directory
changes.

Make another change to the message in __routes/users.js__ and refresh the
webpage to see this in action!

[http://localhost:3000]: http://localhost:3000
[http://localhost:3000/users]: http://localhost:3000/users

### Server file

Node defaults to using CommonJS for its import/export syntax. You have seen ES6
import/export module JavaScript syntax in React (e.g., `import Form from
'./Form'`), but in this MERN project, you will be using CommonJS for importing
and exporting files.

The __bin/www__ file is the entry file for this project's server. You can read
the comments in that file to get a better sense of what each block of code in
that file is doing.

Look for where the server is initialized and when it starts listening for
requests on the port. Can you find where it defines the default port?

Line `15` defines the default port as `3000` if none is specified. As you did
when creating a Rails backend, change the default port to `5000`, the
traditional development backend port.

```js
// change the default port from 3000 to 5000:
var port = normalizePort(process.env.PORT || '5000');
```

> **Note:** If you are using MacOS Monterey or later, you will likely run into a
> port conflict with Apple's AirPlay Receiver, which, inconveniently, also runs
> on port 5000. To disable AirPlay Receiver, go to `System
> Preferences`-->`Sharing`-->`AirPlay Receiver`.

The following lines (`28`-`30`) in the file tell the initialized server to
listen for requests on the specified port.

```js
// listen for requests on the specified port:
server.listen(port);
// failure callback when server has trouble starting:
server.on('error', onError);
// success callback when server starts:
server.on('listening', onListening); 
```

The `onListening` variable is a callback function defined at the bottom of the
file that will log `"Listening on port ${port}"` when the server successfully
starts:

```js
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
```

But wait, do you see `Listening on port 5000` logged in your terminal? No,
because __bin/www__ is using a special logger instead of `console.log`.

The special logger, `debug`, needs to be called with a `namespace` that matches
the `namespace` of the `DEBUG` environment variable.

Take a look at line `8` in __bin/www__. You should see `require('debug')`
invoked with a string like `<project-name>:server`. Let's rename that to
`backend:server`:

```js
// change the second string to 'backend:server':
var debug = require('debug')('backend:server');
```

Stop and restart the server again, but this time, add an environment variable
key-value pair to the beginning of the command to start the server:

```plaintext
DEBUG=backend:server npm run dev
```

You should see `Listening on port 5000` logged in your terminal! The `namespace`
of the `debug` function needs to match the `DEBUG` environment variable.

Try starting the server, but this time run:

```plaintext
DEBUG=backend:* npm run dev
```

You should still see the `Listening on port 5000` logged in your terminal after
the server starts. Why?

The `DEBUG` value of `backend:*` tells the `debug` node module to log any
namespace beginning with `backend:`. Since the `namespace` in __bin/www__ is
`backend:server`, this matches the `backend:*` `DEBUG` value. You could even
split the logging for database actions and server actions like this:

```js
const debug = require('debug');

const serverLogger = debug('backend:server');
const dbLogger = debug('backend:mongodb');
```

You would then invoke the respective console at the appropriate places, e.g.,

```js
dbLogger('Connected to MongoDB successfully');
```

or

```js
serverLogger('Listening on ' + bind);
```

Instead of having to add the `DEBUG` environment variable each time you start
the server, you can take advantage of the `dotenv` node module to load all of
your environment variables from a __.env__ file instead.

Create a new file called __.env__ at the root of your project. Each line in the
file represents a different environment variable key-value pair. The environment
variable name comes first in the line, followed by an `=` sign, then finally the
environment variable value.

Add the `DEBUG` environment variable name and value to the file like so:

```plaintext
DEBUG=backend:*
```

Adjust your __package.json__ `dev` script to call `dotenv` before `nodemon`:

```json
"scripts": {
  "start": "node ./bin/www",
  "dev": "dotenv nodemon ./bin/www --inspect"
}
```

Stop the server and start it again with just `npm run dev`. If you've set
everything up correctly, you should still see `Listening on port 5000` logged in
your terminal!

**Note:** If you want to have the server listen on a different port, you can
add it as an environment variable in your __.env__ file. For example, to have
the server listen on port `5001` instead, add the key-value pair of `PORT=5001`
as a new line in your __.env__ file.

## Adding a __.gitignore__

If you have not done so already, now is a good time to create a GitHub
repository for your project so that you can start getting credit for your
commits. Once you have done so, add a __.gitignore__ file to your root
directory. You will want to ignore your __node_modules__ directory (since it is
so large) as well as your __.env__ file:

```js
node_modules
.env
```

Don't forget to commit early and often!

## Mongoose

Let's connect your application to the MongoDB Atlas database. Recall the string
you saw at the end of the Atlas setup. (It looks something like
`mongodb+srv://<username>:<password>@<cluster-info>.mongodb.net/<collection-name>?retryWrites=true&w=majority`).
You will need it for this part of the setup.

Add a new environment variable called `MONGO_URI` to the __.env__ file and set
it to your own unique connection string that you got from MongoDB Atlas.

Your __.env__ file should now look something like this:

```plaintext
DEBUG=backend:*
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-info>.mongodb.net/<collection-name>?retryWrites=true&w=majority
```

* Make sure to replace `<username>` and `<password>` with the username and
  password you created during the Atlas setup. (The string should already
  include the username.)

Now, to use it in your Express server:

* Create a new directory named __config__
* Make a new file within that directory called __keys.js__
* Add the following code to __keys.js__:

```js
// backend/config/keys.js
module.exports = {
  mongoURI: process.env.MONGO_URI
}
```

> **NOTE:** `process.env` is an object that stores all the environment variables
> as key-value pairs.

* Head back to __bin/www__. At the top of the file with the other imports,
  import the Mongoose node module: `const mongoose = require('mongoose');`
* After that line, import your unique Mongo URI string by typing
  `const { mongoURI: db } = require('../config/keys.js');`
* Before the `server.listen(port)` line, connect Mongoose to the Mongo URI:

  ```js
  mongoose
    .connect(db, { useNewUrlParser: true })
  ```

* `mongoose.connect` will return a Promise. Move the `server.listen(port)` line
  into a Promise chain so that the server will listen for requests only if the
  connection to MongoDB is successful:

  ```js
  mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => {
      // Use `debug` instead of `dbLogger` if you did not split the debug 
      // console into `dbLogger` and `serverLogger` above. 
      dbLogger("Connected to MongoDB successfully");
      server.listen(port);
    })
    // Use `debug` instead of `serverLogger` if you did not split the debug 
    // console into `dbLogger` and `serverLogger` above.
    .catch(err => serverLogger(err));
  ```

  > **Note:** Make sure you don't have another `server.listen(port)` outside of
  > this promise chain!

If you have followed the above steps and entered the correct username and
password, you should see your success message in the console after you restart
your server. That's it! Mongoose and Express are up and running.

This is another good time to **commit your code!**