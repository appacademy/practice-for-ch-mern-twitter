# Seeding Your Database

Once your backend is up and running, you will probably want to seed your
database. As with Rails, seeding with Mongoose can be done by creating a seed
file that you will run from the command line. With Mongoose, however, your seed
file will also have to handle little tasks that Rails typically handles for you
behind the scenes, such as connecting and disconnecting to the database. This
reading will step you through the process.

## Set up your seed file

In the root directory, create a new __seeders__ folder containing a __seeds.js__
file. (Unlike in Rails, there is nothing magical about these file names and
directory structure; you can set it up however you think best.)

Inside __seeds.js__, start by requiring everything Mongoose will need to connect
to the database: a `mongoose` instance, the MongoDB connection string, and your
two models. Then require two additional packages that will help create your
seeds: `bcrypt`--you have to encrypt those passwords!--and [`faker`]. (You will
also need to run `npm install @faker-js/faker` in your __backend__ folder.)

Your file should now look something like this:

```js
const mongoose = require("mongoose");
const { mongoURI: db } = require('../config/keys.js');
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
```

## Create your seeds

Next, create your sample users and tweets. You could create them and save them
to the database one by one, which will work fine if you only want a handful of
seeds. The more seeds you have, however, the slower this method will become
because each seeded object will require a separate call to the database.

These instructions accordingly take a different approach, storing a number of
users and tweets in respective arrays and then inserting them into the database
in bulk, using one database call per model.

When creating your users and tweets, feel free to look back at your models to
see what each requires. Make sure that you construct your seed instances so they
will pass all the validations. The create/post routes can also be helpful for
seeing how to create instances. To hash the password, however, use the
synchronous [`bcrypt.hashSync(password, salt)`].

Here is sample code to create 10 users and 30 tweets. **Your code does not have
to look like this.**

```js
const NUM_SEED_USERS = 10;
const NUM_SEED_TWEETS = 30;

// Create users
const users = [];

users.push(
  new User ({
    username: 'demo-user',
    email: 'demo-user@appacademy.io',
    hashedPassword: bcrypt.hashSync('starwars', 10)
  })
)

for (let i = 1; i < NUM_SEED_USERS; i++) {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  users.push(
    new User ({
      username: faker.internet.userName(firstName, lastName),
      email: faker.internet.email(firstName, lastName),
      hashedPassword: bcrypt.hashSync(faker.internet.password(), 10)
    })
  )
}
  
// Create tweets
const tweets = [];

for (let i = 0; i < NUM_SEED_TWEETS; i++) {
  tweets.push(
    new Tweet ({
      text: faker.hacker.phrase(),
      author: users[Math.floor(Math.random() * NUM_SEED_USERS)]._id
    })
  )
}
```

## Connect to the database and insert your seeds

Once you have created your seeds, it's time to connect to the database. You can
use the code in __backend/bin/www__ as a model:

```js
// Connect to database
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    insertSeeds();
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
```

Finally, write `insertSeeds`. The function should first drop the current
collections so you can seed into a clean database. Then use [`insertMany`] to
insert your seeds into the database:

```js
const insertSeeds = () => {
  console.log("Resetting db and seeding users and tweets...");

  User.collection.drop()
                 .then(() => Tweet.collection.drop())
                 .then(() => User.insertMany(users))
                 .then(() => Tweet.insertMany(tweets))
                 .then(() => {
                   console.log("Done!");
                   mongoose.disconnect();
                 })
                 .catch(err => {
                   console.error(err.stack);
                   process.exit(1);
                 });
}
```

## Run your seed file

To run your seed file, use the following command in your __backend__ directory:

```js
dotenv node seeders/seeds.js
```

(The `dotenv` is necessary for your file to be able to grab the `mongoURI`
connection string from your __.env__ file.)

That's it! Your database should now be full of users and tweets!

[`faker`]: https://fakerjs.dev/
[`bcrypt.hashSync(password, salt)`]: https://www.npmjs.com/package/bcrypt
[`insertMany`]: https://mongoosejs.com/docs/api.html#model_Model-insertMany