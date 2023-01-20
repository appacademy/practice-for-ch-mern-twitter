# Express Routing

At this point, you will start using the Express router so that you can separate
your resources.

## `/api/users` Resource

In the __routes/users.js__ file, you should see a template for setting up an
Express router that currently is being used as a controller for all endpoints
with URLs beginning with `/users`. You can change all the `var` variable
declarations to `const`.

```js
const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
```

The `.get` method on the `router` creates a route handler for `GET` requests.
The first argument to the method defines the URL pattern for the route handler.
The second argument is a callback function that will be called if the request
matches the method and the URL pattern of the route handler.

There are `3` arguments to the callback function:

* `req` - the Request object (has methods and properties used to read or write
  information about the request)
* `res` - the Response object (has methods and properties used to read or write
  information to formulate/send the response)
* `next` - a callback function to trigger the next Express route handler or
  middleware that also matches with the request

The `req` and `res` objects will be the same across all Express route handlers
and middleware in a single request-response cycle. Which means they will also be
different for every request-response cycle.

Start the server and navigate to `/users`. You should see "respond with a
resource" (or whatever you previously changed it to) on the webpage.

Change the response to return a JSON response with an object containing a key of
`"message"` with a value of `"GET /users"`.

```js
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    message: "GET /users"
  });
});
```

`res.json` is a method that will send the response with a JSON body. The
argument to this method will be serialized into JSON and sent as the body of the
response.

Refresh the webpage. You should now see the JSON response.

Now let's repurpose this router to be used as a controller for all endpoints
with URLs beginning with `/api/users` instead of just `/users`.

Change the response to return a JSON response with an object containing a key of
`"message"` with a value of `"GET /api/users"`.

```js
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    message: "GET /api/users"
  });
});
```

Then make the following changes:

* Create a folder within __/routes__ called __/api__.
* Move the __routes/users.js__ file into the __/api__ folder. The file path for
  the file should now be __backend/routes/api/users.js__

Now, you need to update the __app.js__ file. This is where the Express
server's logic originates and where the Express routers are connected to the
Express application. Update each line in the file to look like the following
(you can choose to leave out the comments if you wish):

```js
// backend/app.js

const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/api/users'); // update the import file path

const app = express();

app.use(logger('dev')); // log request components (URL/method) to terminal
app.use(express.json()); // parse JSON request body
app.use(express.urlencoded({ extended: false })); // parse urlencoded request body
app.use(cookieParser()); // parse cookies as an object on req.cookies
app.use(express.static(path.join(__dirname, 'public'))); // serve the static files in the public folder

// Attach Express routers
app.use('/', indexRouter);
app.use('/api/users', usersRouter); // update the path

module.exports = app;
```

The `const usersRouter = require('./routes/users');` line in the __app.js__ file
should be updated to `const usersRouter = require('./routes/api/users');`) since
you moved the __users.js__ file.

The `app.use('/users', usersRouter);` line should be updated to
`app.use('/api/users', usersRouter);`. This will tell the Express application to
attach the route handlers defined in the `usersRouter`--i.e., the Express router
defined in __routes/api/users.js__--to any requests where the URL starts with
`/api/users` (instead of `/users`).

Start the server and navigate to `/api/users`. You should see JSON response of
`GET /api/users` on the webpage.

## `/api/tweets` Resource

Now let's set up the `/api/tweets` resource router.

* Create a file called __tweets.js__ in the __routes/api__ folder.
* Copy the template for creating an Express router in __routes/api/users.js__
  into __tweets.js__. Change the references to `users` to `tweets`.
* Import the Express router exported from the __tweets.js__ file into the
  __app.js__ file.
* Attach the tweets router to the `/api/tweets` path on the Express application.

The __routes/api/tweets.js__ file should look something like this now:

```js
// routes/api/tweets.js

const express = require('express');
const router = express.Router();

/* GET tweets listing. */
router.get('/', function(req, res, next) {
  res.json({
    message: "GET /api/tweets"
  });
});

module.exports = router;
```

Make sure to update the message to reflect the new URL of the route handler.

The __app.js__ file should look something like this now:

```js
// backend/app.js

const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/api/users');
const tweetsRouter = require('./routes/api/tweets');

const app = express();

app.use(logger('dev')); // log request components (URL/method) to terminal
app.use(express.json()); // parse JSON request body
app.use(express.urlencoded({ extended: false })); // parse urlencoded request body
app.use(cookieParser()); // parse cookies as an object on req.cookies
app.use(express.static(path.join(__dirname, 'public'))); // serve the static files in the public folder

// Attach Express routers
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);

module.exports = app;
```

Start the server and navigate to `/api/tweets`. You should see a JSON response
of `GET /api/tweets` on the webpage.

Now you have Express routers for two different resources, `/api/users` and
`/api/tweets`!

**Note:** It's a good idea to start thinking about the routes you will need in
your own project.

You may want to read more about [Express routing].

## Remove the __public__ folder and `index` route

Remove the __public__ folder as you will be using React for your frontend
instead of vanilla HTML/JS/CSS.

For the same reason, also remove __routes/index.js__.

Your folder structure should look like this now:

```plaintext
backend
├── bin
│   └── www
├── config
│   └── keys.js
├── node_modules
├── routes
│   └── api
│       ├── tweets.js
│       └── users.js
├── .env
├── .gitignore
├── app.js
├── package-lock.json
└── package.json
```

Remove the following lines in __app.js__ that served the static files in
the public folder:

```js
// backend/app.js

const path = require('path');
// ...
app.use(express.static(path.join(__dirname, 'public')));
```

Also remove the lines setting up the `index` router:

```js
// backend/app.js

const indexRouter = require('./routes/index');
// ...
app.use('/', indexRouter);
```

Well done! Go ahead and **commit your code** before moving on to server
security.

[Express routing]: https://expressjs.com/en/guide/routing.html
[body parser]: https://www.npmjs.com/package/body-parser