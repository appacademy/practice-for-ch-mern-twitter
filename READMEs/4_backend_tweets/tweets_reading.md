# Tweets

Before you start this section, you will want to review [routing in Express].

## Tweet Validations

Utilizing your knowledge of validator, create a tweets validation. It should
look something like this (try it before you look!):

```js
// validations/tweets.js

const { check } = require("express-validator");
const handleValidationErrors = require('./handleValidationErrors');

// validateTweetInput is a combination Express middleware that uses the `check`
// middleware to validate the keys in the body of a request to create/edit
// a tweet
const validateTweetInput = [
  check('text')
    .exists({ checkFalsy: true })
    .isLength({ min: 5, max: 140 })
    .withMessage('Tweet must be between 5 and 140 characters'),
  handleValidationErrors
];

module.exports = validateTweetInput;
```

## Tweet model

Following a now-familiar pattern, set up a model for your tweets:

```js
// models/Tweet.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tweet', tweetSchema);
```

Note that `author` references a `User` in the `users` collection. This is
equivalent to a foreign key in Rails.

To make this model available in your application, go back to __app.js__ and load
it into memory just like you did for the `User` model:

```js
//backend/app.js

// ...
require('./models/User');
require('./models/Tweet'); // <--ADD THIS LINE
```

## Tweet routes

Next, make routes to retrieve all tweets, a single user's tweets, and individual
tweets. Use Mongoose's [`sort`] to sort multiple tweets in reverse chronological
order. Use Mongoose's [`populate`] to return the `_id` and `username` of each
`author`.

**Note:** MongoDB names the primary key that it assigns to a document `_id`
rather than `id`.

```js
// routes/api/tweets.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Tweet = mongoose.model('Tweet');
const { requireUser } = require('../../config/passport');
const validateTweetInput = require('../../validations/tweets');

router.get('/', async (req, res) => {
  try {
    const tweets = await Tweet.find()
                              .populate("author", "_id username")
                              .sort({ createdAt: -1 });
    return res.json(tweets);
  }
  catch(err) {
    return res.json([]);
  }
});

router.get('/user/:userId', async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.params.userId);
  } catch(err) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errors = { message: "No user found with that id" };
    return next(error);
  }
  try {
    const tweets = await Tweet.find({ author: user._id })
                              .sort({ createdAt: -1 })
                              .populate("author", "_id username");
    return res.json(tweets);
  }
  catch(err) {
    return res.json([]);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
                             .populate("author", "_id username");
    return res.json(tweet);
  }
  catch(err) {
    const error = new Error('Tweet not found');
    error.statusCode = 404;
    error.errors = { message: "No tweet found with that id" };
    return next(error);
  }
});
```

Finally, create a protected route for a user to post tweets:

```js
// routes/api/tweets.js

// Attach requireUser as a middleware before the route handler to gain access
// to req.user. (requireUser will return an error response if there is no 
// current user.) Also attach validateTweetInput as a middleware before the 
// route handler.
router.post('/', requireUser, validateTweetInput, async (req, res, next) => {
  try {
    const newTweet = new Tweet({
      text: req.body.text,
      author: req.user._id
    });

    let tweet = await newTweet.save();
    tweet = await tweet.populate('author', '_id username');
    return res.json(tweet);
  }
  catch(err) {
    next(err);
  }
});
```

Don't forget to export your router: `module.exports = router;`

If this were a real app, you would want to create an authenticated route to
delete tweets, and perhaps some additional routes to add comments or likes. This
tutorial, however, will keep things simple and stick with the ability to
retrieve and create tweets.

Use Postman to test your new routes.

## Next Steps

* **Commit your code!**
* Think through your own database schema.
* Add functionality for reply tweets and/or likes to your backend skeleton.
  Remember the three areas you will need to address:
  * Models
  * Routes
  * Validations
* Populate your database with some dummy data.

[routing in Express]: https://expressjs.com/en/guide/routing.html
[`sort`]: https://mongoosejs.com/docs/api.html#query_Query-sort
[`populate`]: https://mongoosejs.com/docs/api.html#query_Query-populate