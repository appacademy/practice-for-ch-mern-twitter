# User Login

Now let's add an endpoint to log in a user using an email and password
combination.

You will be using the `passport` node module for managing authentication.

You will also be using the `passport-local` node module, an extension for
`passport` that authenticates users with a username and password combination.
First, let's configure the `passport` node module to use the `passport-local`
extension.

Create a __passport.js__ file in the __config__ directory and import the
following node modules at the top of the file:

```js
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');
```

Configure the `passport` node module to use the `passport-local` extension:

```js
passport.use(new LocalStrategy({
  session: false,
  usernameField: 'email',
  passwordField: 'password',
}, async function (email, password, done) {
  const user = await User.findOne({ email });
  if (user) {
    bcrypt.compare(password, user.hashedPassword, (err, isMatch) => {
      if (err || !isMatch) done(null, false);
      else done(null, user);
    });
  } else
    done(null, false);
}));
```

The `LocalStrategy` will extract the `email` and `password` keys from the
request body to compare with the `email` and `hashedPassword` values in the
`users` collection in the database.

It will attempt to find a `User` instance with an `email` that matches
`req.body.email`. If there is no user found with that email, then the `done`
callback function is invoked. The `done` callback takes in two arguments: 1) any
errors to be passed on, and 2) the user information if they are successfully
authenticated. If no user is found, there are no errors, but there is also no
authenticated user.

If a user with that email is found, then `req.body.password` is matched
with the `hashedPassword` value of that user using `bcrypt`. If there is a
successful match, then the user is authenticated and passed along as the second
argument of the  `done` callback.

Once `passport` has been configured to use the `passport-local` extension,
import this file into __app.js__ to load this configuration into the server.

> **Note:** You must add this line **after** the line loading the `User` model
> schema, i.e., `require('./models/User');`. Otherwise, Mongoose will throw the
> `MissingSchemaError` again when `passport` tries to load the `User` model.

After you have loaded the configuration, import `passport` too:

```js
// backend/app.js

// ...
require('./models/User');
require('./config/passport'); // <-- ADD THIS LINE
const passport = require('passport'); // <-- ADD THIS LINE
```

Also in __app.js__, attach the `passport` to the Express application:

```js
// add this line right before the CORS and CSRF configurations
app.use(passport.initialize());
```

Now, whenever a user attempts to log in, it will trigger the `passport-local`
extension to authenticate the user.

In __routes/api/users.js__, import `passport` along with the other imports at
the top of the file:

```js
const passport = require('passport');
```

Create a `POST /api/users/login` route handler for user login. The (`async`)
callback should call `passport.authenticate` with a first argument of `'local'`.
This argument tells Passport to use the `LocalStrategy` that you just configured
to authenticate the user. If the user is successfully authenticated, return the
user information. Otherwise, return a `400` error response with a message of
"Invalid credentials".

The handler should look something like this:

```js
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
    return res.json({ user });
  })(req, res, next);
});
```

Test your login functionality using Postman with both a correct and incorrect
email address:

1. Test whether or not you can log in an existing user using Postman

   * Make a `POST` request to `http://localhost:5000/api/users/login`.
   * Use the `raw` body type and select `JSON` in the dropdown.
   * Add an `email` and `password` to the request body:

     ```json
     {
       "email": "demo@user.io",
       "password": "password"
     }
     ```

   * Confirm the JSON response body includes the `user` key with the user
     information.

2. Test whether or not you can log in a non-existent user using Postman

   * Make a `POST` request to `http://localhost:5000/api/users/login`.
   * Use the `raw` body type and select `JSON` in the dropdown.
   * Add an invalid `email` and `password` to the request body:

     ```json
     {
       "email": "invalid@user.io",
       "password": "password"
     }
     ```

   * Confirm the JSON response body includes the `message` of "Invalid
     credentials" with a status code of `400`.

3. Test whether or not you can log in an existing user with invalid credentials
   using Postman

   * Make a `POST` request to `http://localhost:5000/api/users/login`.
   * Use the `raw` body type and select `JSON` in the dropdown.
   * Add an `email`, and `password` to the request body:

     ```json
     {
       "email": "demo@user.io",
       "password": "invalid"
     }
     ```

   * Confirm the JSON response body includes the `message` of "Invalid
     credentials" with a status code of `400`.

## Next steps

You just added the ability to register and log in as a user on the server.
(**Tip:** Now would be a great time to **commit your code!**)

You have not yet implemented a way to identify that user after registration and
login, however. In the next steps, you will implement an authentication method
that uses a JWT (JSON Web Token) - as opposed to the session-based
authentication that you used in Rails - to identify a user as the current user.