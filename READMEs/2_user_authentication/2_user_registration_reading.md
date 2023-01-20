# User Registration

Now let's add an endpoint to register or create a user.

In __routes/api/users.js__, you will create a `POST /api/users/register` route
handler for user registration.

Start by importing `bcryptjs` as `bcrypt` at the top of the file:

```js
const bcrypt = require('bcryptjs');
```

And `mongoose` and the `User` model:

```js
const mongoose = require('mongoose');
const User = mongoose.model('User');
```

This last line will raise a `MissingSchemaError` because the `Schema hasn't been
registered for model "User"`. To fix this, you need to load the `User` model
that you exported from __models/User.js__. While you could load it in this file,
load it in the main __app.js__ instead to make it easy for other files that
require the model to ensure they are also loaded after the model. Just add the
following line before you import the `usersRouter` (which, as you just saw, now
requires that the model already be loaded):

```js
// backend/app.js

// ...
require('./models/User');

const usersRouter = require('./routes/api/users');
// ....
```

Next, set up a route handler to register new users. This time, you will want the
callback to be asynchronous:

```js
// routes/api/users.js

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  // Your code will go here
});
```

Before it does anything else, this route handler needs to make sure that no one
has already registered with the proposed email or username. To do this, query
the database to see if it already contains a user with the proposed email or
username.

> __Tip:__ Use Mongo's logical query operator [`$or`] as part of a [Mongoose
> `findOne`][mongoose-findone] query (which essentially just calls [MongoDB's
> `findOne`][mongo-findone]).

If the query returns a user, throw a 400 error.

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
});
```

If the query fails to find anyone, then you are good to create and save the new
user in the database! (For now, just assume that the input is valid; you will
add validations in a few phases.)

Create a new `User` with the given email and username. Don't include the
password: you don't want to store the password in plain text! Instead, use
`bcrypt` to create a salted and encrypted password hash that can be stored in
the new user's `hashedPassword` field. Then save the user to the database and
return it as JSON. (Once you set up Passport, you will want to log in the newly
created user as well.)

Putting all of these components together looks like this:

```js
//routes/api/users.js

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  // Check to make sure no one has already registered with the proposed email or
  // username.
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  });

  if (user) {
    // Throw a 400 error if the email address and/or email already exists
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
        return res.json({ user });
      }
      catch(err) {
        next(err);
      }
    })
  });
});

module.exports = router;
```

Use Postman to test whether or not you can register a new user:

* Make a `POST` request to `http://localhost:5000/api/users/register`.
* Use the `raw` body type and select `JSON` in the dropdown.
* Add a `username`, `email`, and `password` to the request body:

  ```json
  {
    "username": "DemoUser",
    "email": "demo@user.io",
    "password": "password"
  }
  ```

* Confirm the JSON response body includes the `user` key with the user
  information.
* Checking your Atlas cluster, you should see that it has automatically created
  a `users` collection. When you click on this collection, you should see that
  the user you just created now exists in the database.

Congratulations, you now have users! Next up: login (right after you **commit
your code,** of course).

[`$or`]: https://www.mongodb.com/docs/v6.0/reference/operator/query/or/#-or
[mongoose-findone]: https://mongoosejs.com/docs/api.html#model_Model-findOne
[mongo-findone]: https://www.mongodb.com/docs/manual/reference/method/db.collection.findOne/#with-a-query-specification