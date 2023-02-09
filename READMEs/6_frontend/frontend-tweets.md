# Frontend Tweets

Let's finish up this tutorial by adding some functionality for tweets. You want
a page where all users' tweets are rendered, a profile page where your
authenticated user's tweets are rendered, and a page to compose new tweets.
Since you are very familiar with the Redux cycle by now, this section will move
quickly.

## Tweet actions

Start by defining your tweet actions. You will want to receive all tweets, a
user's tweets, a new tweet, and tweet errors. You will also want an action for
clearing tweet errors. Define your actions in a new file in your __store__
directory called __tweets.js__:

```js
// src/store/tweets.js

import jwtFetch from './jwt';
import { RECEIVE_USER_LOGOUT } from './session';

const RECEIVE_TWEETS = "tweets/RECEIVE_TWEETS";
const RECEIVE_USER_TWEETS = "tweets/RECEIVE_USER_TWEETS";
const RECEIVE_NEW_TWEET = "tweets/RECEIVE_NEW_TWEET";
const RECEIVE_TWEET_ERRORS = "tweets/RECEIVE_TWEET_ERRORS";
const CLEAR_TWEET_ERRORS = "tweets/CLEAR_TWEET_ERRORS";

const receiveTweets = tweets => ({
  type: RECEIVE_TWEETS,
  tweets
});

const receiveUserTweets = tweets => ({
  type: RECEIVE_USER_TWEETS,
  tweets
});

const receiveNewTweet = tweet => ({
  type: RECEIVE_NEW_TWEET,
  tweet
});

const receiveErrors = errors => ({
  type: RECEIVE_TWEET_ERRORS,
  errors
});

export const clearTweetErrors = errors => ({
    type: CLEAR_TWEET_ERRORS,
    errors
});
```

## `jwtFetch` calls

Next, add the API calls to fetch all tweets, fetch an individual user's tweets,
and write a new tweet.

```js
// src/store/tweets.js

// ...

export const fetchTweets = () => async dispatch => {
  try {
    const res = await jwtFetch ('/api/tweets');
    const tweets = await res.json();
    dispatch(receiveTweets(tweets));
  } catch (err) {
    const resBody = await err.json();
    if (resBody.statusCode === 400) {
      dispatch(receiveErrors(resBody.errors));
    }
  }
};

export const fetchUserTweets = id => async dispatch => {
  try {
    const res = await jwtFetch(`/api/tweets/user/${id}`);
    const tweets = await res.json();
    dispatch(receiveUserTweets(tweets));
  } catch(err) {
    const resBody = await err.json();
    if (resBody.statusCode === 400) {
      return dispatch(receiveErrors(resBody.errors));
    }
  }
};

export const composeTweet = data => async dispatch => {
  try {
    const res = await jwtFetch('/api/tweets/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const tweet = await res.json();
    dispatch(receiveNewTweet(tweet));
  } catch(err) {
    const resBody = await err.json();
    if (resBody.statusCode === 400) {
      return dispatch(receiveErrors(resBody.errors));
    }
  }
};
```

## Reducers

First create a reducer to handle errors that occur when composing a tweet. You
also want to clear any tweet errors whenever you receive a new tweet or an
explicit `CLEAR_TWEET_ERRORS` action. (Try to code this on your own before
looking below; if you get stuck, look back at the similar
`sessionErrorsReducer`.)

```js
// src/store/tweets.js

// ...

const nullErrors = null;

export const tweetErrorsReducer = (state = nullErrors, action) => {
  switch(action.type) {
    case RECEIVE_TWEET_ERRORS:
      return action.errors;
    case RECEIVE_NEW_TWEET:
    case CLEAR_TWEET_ERRORS:
      return nullErrors;
    default:
      return state;
  }
};
```

Finally, create a reducer for your tweets:

```js
// src/store/tweets.js

// ...

const tweetsReducer = (state = { all: {}, user: {}, new: undefined }, action) => {
  switch(action.type) {
    case RECEIVE_TWEETS:
      return { ...state, all: action.tweets, new: undefined};
    case RECEIVE_USER_TWEETS:
      return { ...state, user: action.tweets, new: undefined};
    case RECEIVE_NEW_TWEET:
      return { ...state, new: action.tweet};
    case RECEIVE_USER_LOGOUT:
      return { ...state, user: {}, new: undefined }
    default:
      return state;
  }
};

export default tweetsReducer;
```

**Don't forget to import your reducers into the error reducer and root reducer,
respectively!**

## Routes

Let's add some routes for three new components: `Tweets`, `Profile`, and
`TweetCompose`.

```js
// src/App.js

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch } from 'react-router-dom';

import { AuthRoute, ProtectedRoute } from './components/Routes/Routes';
import NavBar from './components/NavBar/NavBar';

import MainPage from './components/MainPage/MainPage';
import LoginForm from './components/SessionForms/LoginForm';
import SignupForm from './components/SessionForms/SignupForm';
import Tweets from './components/Tweets/Tweets';
import Profile from './components/Profile/Profile';
import TweetCompose from './components/Tweets/TweetCompose';

import { getCurrentUser } from './store/session';

function App() {
  const [loaded, setLoaded] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCurrentUser()).then(() => setLoaded(true));
  }, [dispatch]);

  return loaded && (
    <>
      <NavBar />
      <Switch>
        <AuthRoute exact path="/" component={MainPage} />
        <AuthRoute exact path="/login" component={LoginForm} />
        <AuthRoute exact path="/signup" component={SignupForm} />

        <ProtectedRoute exact path="/tweets" component={Tweets} />
        <ProtectedRoute exact path="/profile" component={Profile} />
        <ProtectedRoute exact path="/tweets/new" component={TweetCompose} />
      </Switch>
    </>
  );
}

export default App;
```

Now let's make these three components in order.

## All tweets

Make a new __Tweets__ directory in __components__. You'll create the next few
files here.

Start by creating a component to render individual tweets:

```js
// src/components/Tweets/TweetBox.js

import "./TweetBox.css"

function TweetBox ({ tweet: { text, author }}) {
  const { username } = author;
  return (
    <div className="tweet">
      <h3>{username}</h3>
      <p>{text}</p>
    </div>
  );
}

export default TweetBox;
```

Remember that you told the backend to include the author's `username` when
sending tweets to the frontend? Here's where that becomes useful. It would also
be nice to render the time when a tweet was tweeted; you can add that capability
later if you want. Separating this tweet-rendering functionality into its own
component allows you to easily standardize and change the way you represent
tweets across components. In fact, feel free to change the proposed formatting
above!

Go ahead and add some basic styling in a __TweetBox.css__ file as well. (The
code snippet above already imports __TweetBox.css__ into __TweetBox.js__.) Here
are a few suggestions to get you started:

```css
/* frontend/src/components/Tweets/TweetBox.css */

p, h3 {
  margin-left: 5px;
}

.tweet {
  border: 2px solid blue;
  border-radius: 10px;
  margin-bottom: 5px;
  min-height: 57px;
}
```

Now make the component to show all tweets by all users:

```js
// src/components/Tweets/Tweets.js

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearTweetErrors, fetchTweets } from '../../store/tweets';
import TweetBox from './TweetBox';

function Tweets () {
  const dispatch = useDispatch();
  const tweets = useSelector(state => Object.values(state.tweets.all));
  
  useEffect(() => {
    dispatch(fetchTweets());
    return () => dispatch(clearTweetErrors());
  }, [dispatch])

  if (tweets.length === 0) return <div>There are no Tweets</div>;
  
  return (
    <>
      <h2>All Tweets</h2>
      {tweets.map(tweet => (
        <TweetBox key={tweet._id} tweet={tweet} />
      ))}
    </>
  );
}

export default Tweets;
```

## Profile

Next set up a similar component to render a user's tweets on their profile page.
(You'll want to create a new directory for this.)

```js
// src/components/Profile/Profile.js

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserTweets, clearTweetErrors } from '../../store/tweets';
import TweetBox from '../Tweets/TweetBox';

function Profile () {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.session.user);
  const userTweets = useSelector(state => Object.values(state.tweets.user))
  
  useEffect(() => {
    dispatch(fetchUserTweets(currentUser._id));
    return () => dispatch(clearTweetErrors());
  }, [currentUser, dispatch]);

  if (userTweets.length === 0) {
    return <div>{currentUser.username} has no Tweets</div>;
  } else {
    return (
      <>
        <h2>All of {currentUser.username}'s Tweets</h2>
        {userTweets.map(tweet => (
          <TweetBox
            key={tweet._id}
            tweet={tweet}
          />
        ))}
      </>
    );
  }
}

export default Profile;
```

## Composing tweets

Finally, create a component that enables a user to post a new tweet. Preview the
tweet below the form. Once a tweet has been submitted, also show the
successfully submitted tweet below the preview. Remember to set a cleanup
function to remove any errors if `TweetCompose` is unmounted!

```js
// src/components/Tweets/TweetCompose.js

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearTweetErrors, composeTweet } from '../../store/tweets';
import TweetBox from './TweetBox';
import './TweetCompose.css';

function TweetCompose () {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const author = useSelector(state => state.session.user);
  const newTweet = useSelector(state => state.tweets.new);
  const errors = useSelector(state => state.errors.tweets);

  useEffect(() => {
    return () => dispatch(clearTweetErrors());
  }, [dispatch]);

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(composeTweet({ text })); 
    setText('');
  };

  const update = e => setText(e.currentTarget.value);

  return (
    <>
      <form className="compose-tweet" onSubmit={handleSubmit}>
        <input 
          type="textarea"
          value={text}
          onChange={update}
          placeholder="Write your tweet..."
          required
        />
        <div className="errors">{errors?.text}</div>
        <input type="submit" value="Submit" />
      </form>
      <div className="tweet-preview">
        <h3>Tweet Preview</h3>
        {text ? <TweetBox tweet={{text, author}} /> : undefined}
      </div>
      <div className="previous-tweet">
        <h3>Previous Tweet</h3>
        {newTweet ? <TweetBox tweet={newTweet} /> : undefined}
      </div>
    </>
  )
}

export default TweetCompose;
```

Once again, add a little styling in a __TweetCompose.css__ file:

```css
/* frontend/src/components/Tweets/TweetCompose.css */

input[type=textarea] {
  min-height: 30px;
  min-width: 393px;
  margin-top: 5px;
}

.tweet-preview {
  min-height: 150px;
}
```

Congratulations! You've finished implementing the frontend! Go ahead and
**commit your code** as the first step toward deployment.