# JWT Authentication

Before starting this section, review the documentation for [jsonwebtoken].

Instead of using a session token cookie to authenticate a user after login, you
will use a JSON Web Token (JWT, pronounced "jot") to authenticate a user after
login.

After registering or logging in a user, you should send a JWT with the user's
information in the payload to the frontend/client. The frontend/client can send
the JWT back in the header of a request to re-authenticate themselves without
having to log in again for a period of time.

## Signature

A JWT has a signature that should be as unique to the server as possible. Only
the server should know and be able to verify the JWT's signature.

Add a strong secret signature to the __.env__ file under a key of
`SECRET_OR_KEY`.

> Recommendation to generate a strong secret: create a random string using
> `openssl` (a library that should already be installed in your Ubuntu/MacOS
> shell). Run `openssl rand -base64 10` to generate a random JWT secret.

Export the value of the `SECRET_OR_KEY` environment variable from
__config/keys.js__.

```js
// config/keys.js

module.exports = {
  secretOrKey: process.env.SECRET_OR_KEY,
  mongoURI: process.env.MONGO_URI,
  isProduction: process.env.NODE_ENV === 'production'
};
```

## Generate a JWT

Now you will create a function in __config/passport.js__ to generate a JWT from
a user's information and package it with non-sensitive user information.
(**NEVER send the `hashedPassword` field on a `User` to the frontend!**)

First, import the `jsonwebtoken` node module at the top of
__config/passport.js__.

```js
const jwt = require('jsonwebtoken');
```

Then, import `secretOrKey` from __config/keys.js__.

```js
const { secretOrKey } = require('./keys');
```

Next, create and export an `async` function called `loginUser` that will take
a `User` instance. It should generate a JWT with a payload containing
non-sensitive user information and sign it with the `secretOrKey`. It should
set the JWT to expire after 1 hour. The function should return an object with a
`user` key containing the non-sensitive user information object and a `token`
key with the generated JWT token.

```js
exports.loginUser = async function(user) {
  const userInfo = {
    _id: user._id,
    username: user.username,
    email: user.email
  };
  const token = await jwt.sign(
    userInfo, // payload
    secretOrKey, // sign with secret key
    { expiresIn: 3600 } // tell the key to expire in one hour
  );
  return {
    user: userInfo,
    token
  };
};
```

Now, import the `loginUser` function into the __routes/api/users.js__ file.

```js
const { loginUser } = require('../../config/passport');
```

Call the `loginUser` function after both registering and logging in a user:

```js
// POST /api/users/register
router.post('/register', async (req, res, next) => {
  // Check to make sure no one has already registered with the proposed email or
  // username.
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  });

  if (user) {
    // Throw a 400 error if the email address and/or username already exists
    const err = new Error("Validation Error");
    err.statusCode = 400;
    const errors = {};
    if (user.email === req.body.email) {
      errors.email = "A user has already registered with this email";
    }
    if (user.username === req.body.username) {
      errors.username = "A user has already registered with this username";
    }
    err.errors = errors;
    return next(err);
  }

  // Otherwise create a new user
  const newUser = new User({
    username: req.body.username,
    email: req.body.email
  });

  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(req.body.password, salt, async (err, hashedPassword) => {
      if (err) throw err;
      try {
        newUser.hashedPassword = hashedPassword;
        const user = await newUser.save();
        return res.json(await loginUser(user)); // <-- THIS IS THE CHANGED LINE
      }
      catch(err) {
        next(err);
      }
    })
  });
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  passport.authenticate('local', async function(err, user) {
    if (err) return next(err);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 400;
      err.errors = { email: "Invalid credentials" };
      return next(err);
    }
    return res.json(await loginUser(user)); // <-- THIS IS THE CHANGED LINE
  })(req, res, next);
});
```

Eventually, the `token`s returned from these endpoints will be saved on the
frontend and sent back to the backend to re-authenticate the user without
having to give login credentials.

Now try the following:

> **Note:** Nodemon does not monitor your __.env__ file, and `dotenv` does not
> monitor environment variables after it initially loads them. You will
> accordingly need to restart your app manually for it to acknowledge your new
> `SECRET_OR_KEY` environment variable.

* Make a `POST` request to `http://localhost:5000/api/users/register`.
  * Use the `raw` body type and select `JSON` in the dropdown.
  * Add a `username`, `email`, and `password` to the request body:

    ```json
    {
      "username": "DemoUser1",
      "email": "demo1@user.io",
      "password": "password"
    }
    ```

  * Confirm the JSON response body includes the `user` key with the user
    information and a `token` key with a JWT.

* Make a `POST` request to `http://localhost:5000/api/users/login`.
  * Use the `raw` body type and select `JSON` in the dropdown.
  * Add an `email` and `password` to the request body:

    ```json
    {
      "email": "demo1@user.io",
      "password": "password"
    }
    ```

  * Confirm the JSON response body includes the `user` key with the user
    information and a `token` key with a JWT.

## Verify a JWT

Before starting this section, review the documentation for [passport-jwt].

All of the logic for your initial user authentication is complete. (Yea!)
However, you will need to use `passport-jwt`, another extension for `passport`,
to authenticate the JWT and construct private routes.

The JWT token will be sent to the backend from the frontend as a request header
called `Authentication`. `passport-jwt` should be configured to read the
`Authentication` request header and verify that the value is a valid JWT.

To set this up, first import the `passport-jwt` node module into the
__config/passport.js__ file:

```js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
```

Configure `passport` to use the `passport-jwt` extension with `secretOrKey` as
the signature to verify the JWT tokens:

**NOTE:** This new `JwtStrategy` is **in addition to**--not a refactoring
of--the `LocalStrategy` that you previously defined. The two strategies are
authenticating in different ways.

```js
// config/passport.js

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = secretOrKey;

passport.use(new JwtStrategy(options, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload._id)
    if (user) {
      // return the user to the frontend
      return done(null, user);
    }
    // return false since there is no user
    return done(null, false);
  }
  catch(err) {
    done(err);
  }
}));
```

If `passport-jwt` verifies that the JWT token has the same signature and a user
with the same `_id` as in the payload, then it will add the user instance as a
key of `user` on the Request object, `req.user`.

Next, create an Express middleware called `requireUser`. This middleware will
create a protected route by returning an error response if there is no
authenticated user:

```js
// config/passport.js

exports.requireUser = passport.authenticate('jwt', { session: false });
```

Finally, create another Express middleware called `restoreUser` that will set
the user on `req.user` if there is an authenticated user. If there is no
authenticated user, then `req.user` will be `undefined`.

```js
// config/passport.js

exports.restoreUser = (req, res, next) => {
  return passport.authenticate('jwt', { session: false }, function(err, user) {
    if (err) return next(err);
    if (user) req.user = user;
    next();
  })(req, res, next);
};
```

Now head back to __users.js__. Import `restoreUser` from __passport.js__ and
`isProduction` from __keys.js__:

```js
// routes/api/users.js

const { loginUser, restoreUser } = require('../../config/passport');
const { isProduction } = require('../../config/keys');
```

Create a route to return the authenticated user at `GET /api/users/current`. If
there is NO authenticated user, return `null` as the JSON response. Otherwise
return non-sensitive information about the authenticated user.

```js
// routes/api/users.js

router.get('/current', restoreUser, (req, res) => {
  if (!isProduction) {
    // In development, allow React server to gain access to the CSRF token
    // whenever the current user information is first loaded into the
    // React application
    const csrfToken = req.csrfToken();
    res.cookie("CSRF-TOKEN", csrfToken);
  }
  if (!req.user) return res.json(null);
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email
  });
});
```

This endpoint will be used to initially load the current user into the React
application. It will also serve as a way for the React application to
gain access to the `CSRF-Token` header value.

Querying for your current user in Postman, you should see a response with your
current user object. For your `/current` route to work, however, you will
need to set an `Authorization` header with a value of `Bearer <token>`, where
`<token>` is the token string that was returned in the body when you logged in.
(If you didn't save the token, just log in again.)

You've reached another great point to **commit your code!**

[passport-jwt]: https://www.npmjs.com/package/passport-jwt
[jsonwebtoken]: https://www.npmjs.com/package/jsonwebtoken
[random-key]: https://randomkeygen.com/