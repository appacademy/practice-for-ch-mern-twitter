# User Auth

Let's start with the basics: allowing users to create an account.

## The user model

Each resource needs to have a Mongoose model with a schema. Let's create a model
for your users.

* Create a new directory in __backend__ called __models__.
* By convention, model files in Mongoose are singular and start with a capital
  letter. Create a file in __models__ called __User.js__.
* At the top of the file, import Mongoose. You will also need to require the
  Mongoose Schema:

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
```

Now think ahead to the information you will need to require from a user and set
up your schema:

```js
const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
```

The `timestamps: true` key tells Mongoose to add and maintain the `createdAt`
and `updatedAt` fields on the `User` model. The `createdAt` field on a user
instance is the date-time value of when the user was added to the database.
The `updatedAt` field is the date-time value of when the user information was
last edited in the database.

Don't forget to export your model:

```js
module.exports = mongoose.model('User', userSchema);
```

Before moving on, read about [defining models in Mongoose] (and **commit your
code!**).

[defining models in Mongoose]: https://mongoosejs.com/docs/guide.html