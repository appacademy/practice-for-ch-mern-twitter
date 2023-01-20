# Express Server Security

Let's secure your server from the most common server attacks!

## Cross-Origin Resource Sharing (CORS)

A [CORS policy] is a common web security defense to help mitigate the risks of
cross-origin HTTP requests. By default, Express does not have a CORS policy
defined, so modern browsers will restrict CORS (i.e., disable CORS) for a
default Express server.

Since the React development server runs on a different port than the Express
server and will be making requests to the Express server, CORS needs to be
enabled on the Express server for the React dev server to "talk" to the Express
server. In production, however, the React files will be served on the Express
server. So you should enable CORS only in development; production will not need
that capability.

To do this, first define an `isProduction` key on the exported object in
__config/keys.js__. The value of this key should be a boolean indicating whether
the application environment is development or production. In
Node.js, this is usually indicated by the `NODE_ENV` environment variable. If it
equals `'production'`, then the application is in production:

```js
// backend/config/keys.js

module.exports = {
  mongoURI: process.env.MONGO_URI,
  isProduction: process.env.NODE_ENV === 'production'
}
```

Import the `isProduction` key and the `cors` middleware into __app.js__. **If
the app is NOT in production,** connect `cors` to the Express
application--`app.use(cors())`--right before you attach the Express routers.

Your __app.js__ file should now look something like this:

```js
// backend/app.js

const express = require("express");
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// ADD THESE TWO LINES
const cors = require('cors');
const { isProduction } = require('./config/keys');

const usersRouter = require('./routes/api/users');
const tweetsRouter = require('./routes/api/tweets');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ADD THIS SECURITY MIDDLEWARE
// Security Middleware
if (!isProduction) {
  // Enable CORS only in development because React will be on the React
  // development server (http://localhost:3000). (In production, the Express 
  // server will serve the React files statically.)
  app.use(cors());
}

// Attach Express routers
app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);

module.exports = app;
```

Now your Express server is set up so that it will enable CORS for all
applications in development, but not for those in production.

## CSRF

[CSRF protection] is a common web security defense to help mitigate the risks of
identity theft on an application.

In this project, you will use the `csurf` node module to enable CSRF protection
on the Express server. Import the `csurf` node module into __app.js__ and
connect it to the Express application before attaching the route handlers:

```js
// backend/app.js

const csurf = require('csurf');
// ...
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);
```

This sets a unique CSRF token on the `_csrf` HTTP-only cookie.

Your __app.js__ should now look something like this:

```js
// backend/app.js

const express = require("express");
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');
const csurf = require('csurf');
const { isProduction } = require('./config/keys');

const usersRouter = require('./routes/api/users');
const tweetsRouter = require('./routes/api/tweets');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Security Middleware
if (!isProduction) {
  // Enable CORS only in development because React will be on the React
  // development server (http://localhost:3000). (In production, React files
  // will be served statically on the Express server.)
  app.use(cors());
}

// Set the _csrf token and create req.csrfToken method to generate a hashed
// CSRF token
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);

// Attach Express routers
app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);

module.exports = app;
```

`csurf` will stop all non-`GET` requests from executing on the server unless
there is a `CSRF-Token` header on the request that matches the `_csrf` cookie.
If the `_csrf` cookie matches the `CSRF-Token` header on a request, then
the request action will be allowed. If not, then a CSRF error response will be
returned and the request action will NOT be allowed to execute.

How does the frontend/client know the correct value of the `CSRF-Token` header
to send on the request?

The `CSRF-Token` can be generated from the `.csrfToken()` method set on the
Request object--i.e., `req`--by the `csurf` node module (`const csrfToken =
req.csrfToken()`).

In production, the `CSRF-Token` will be sent as a cookie when the React
application files get sent to the frontend.

In development, though, the `CSRF-Token` needs to be accessible when testing the
non-`GET` endpoints outside of interacting with the frontend.

In the next section, you will expose an endpoint on the server to return that
`CSRF-Token` value only when the server is in development.

### `/api/csrf/restore`

The `GET /api/csrf/restore` endpoint will return `CSRF-Token` as a key on the
JSON body of the response.

To do this, create a router for an `/api/csrf` resource:

* Create a file called __csrf.js__ in the __routes/api__ folder.
* Copy the template for creating an Express router in __routes/api/users.js__
  into the __csrf.js__ file.
* Import the Express router exported from __csrf.js__ into __app.js__.
* Attach the csrf router to the `/api/csrf` path on the Express application.

In the __csrf.js__ router file, add a route handler for `GET /api/csrf/restore`
that returns the JSON `{ 'CSRF-Token': req.csrfToken() }` **when the Express
application is not in production.**

The __routes/api/csrf.js__ file should look something like this:

```js
// routes/api/csrf.js

const express = require('express');
const router = express.Router();

const { isProduction } = require('../../config/keys');

if (!isProduction) {
  // In development, allow developers to access the CSRF token to test the
  // server endpoints in Postman.
  router.get("/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.status(200).json({
      'CSRF-Token': csrfToken
    });
  });
}

module.exports = router;
```

Your __app.js__ should now look something like this:

```js
// backend/app.js

const express = require("express");
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');
const csurf = require('csurf');
const { isProduction } = require('./config/keys');

const usersRouter = require('./routes/api/users');
const tweetsRouter = require('./routes/api/tweets');
const csrfRouter = require('./routes/api/csrf');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Security Middleware
if (!isProduction) {
  // Enable CORS only in development because React will be on the React
  // development server (http://localhost:3000). (In production, React files
  // will be served statically on the Express server.)
  app.use(cors());
}

// Set the _csrf token and create req.csrfToken method to generate a hashed
// CSRF token
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);

// Attach Express routers
app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);
app.use('/api/csrf', csrfRouter);

module.exports = app;
```

Open up Postman and try making a non-`GET` request like `POST /whatever` to the
Express server. Take a look at the response that you get back. If you read the
returned error message, it tells you that there was a `ForbiddenError: invalid
csrf token`. Check the `Cookies` in Postman. You'll see a cookie with the name
of `_csrf`. Since the request did not have a valid `CSRF-Token` header that
matches the `_csrf` cookie, the server returned the `ForbiddenError`.

Now try making a request to `GET /api/csrf/restore` on Postman. Take the value
in the response body and add it as a `CSRF-Token` header on the request to
`POST /whatever`. You should see a different error message like
`Cannot POST /whatever`. This means that the `CSRF-Token` header was validated
against the `_csrf` cookie and the request by-passed the CSRF protection in the
server.

As long as a non-`GET` request has a valid `CSRF-Token` header value and the
`_csrf` cookie, the request will by-pass the CSRF protection.

Great job protecting your app from CORS and CSRF attacks! In the next phase, you
will complete the general setup for your app by implementing error handling.
Don't forget to **commit your code** before proceeding!

[CORS policy]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
[CSRF protection]: https://developer.mozilla.org/en-US/docs/Glossary/CSRF