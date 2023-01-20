# Frontend Auth, Phase 5: Login And Signup

Set up the Redux cycle for user authentication. The current user will be stored
in the `session` slice of state under the key of `user`. You'll start by
creating the session actions and reducer, then move on to handling session
errors.

## Session actions

Make a new file in your __store__ folder called __session.js__. Inside, begin by
defining your session actions. You want to receive the current user and receive
user logout. In anticipation of handling session errors, go ahead and include
actions for receiving and clearing session errors too.

```js
// src/store/session.js

import jwtFetch from './jwt';

const RECEIVE_CURRENT_USER = "session/RECEIVE_CURRENT_USER";
const RECEIVE_SESSION_ERRORS = "session/RECEIVE_SESSION_ERRORS";
const CLEAR_SESSION_ERRORS = "session/CLEAR_SESSION_ERRORS";
export const RECEIVE_USER_LOGOUT = "session/RECEIVE_USER_LOGOUT";

// Dispatch receiveCurrentUser when a user logs in.
const receiveCurrentUser = currentUser => ({
  type: RECEIVE_CURRENT_USER,
  currentUser
});
  
// Dispatch receiveErrors to show authentication errors on the frontend.
const receiveErrors = errors => ({
  type: RECEIVE_SESSION_ERRORS,
  errors
});

// Dispatch logoutUser to clear the session user when a user logs out.
const logoutUser = () => ({
  type: RECEIVE_USER_LOGOUT
});

// Dispatch clearSessionErrors to clear any session errors.
export const clearSessionErrors = () => ({
  type: CLEAR_SESSION_ERRORS
});
```

Next, write the corresponding `login` and `signup` actions. Don't forget to
store the JWT token in `localStorage` after a successful login!

> **Note:** Because `signup` also logs in the newly created user, `login` and
> `signup` essentially differ only in their route and user information sent. You
> should accordingly be able to abstract their common elements into a helper
> function.

```js
// store/session.js

export const signup = user => startSession(user, 'api/users/register');
export const login = user => startSession(user, 'api/users/login');

const startSession = (userInfo, route) => async dispatch => {
  try {  
    const res = await jwtFetch(route, {
      method: "POST",
      body: JSON.stringify(userInfo)
    });
    const { user, token } = await res.json();
    localStorage.setItem('jwtToken', token);
    return dispatch(receiveCurrentUser(user));
  } catch(err) {
    const res = await err.json();
    if (res.statusCode === 400) {
      return dispatch(receiveErrors(res.errors));
    }
  }
};
```

Finally, write `logout`. Note that you wll need to remove the JWT token from
`localStorage`!

```js
// store/session.js

export const logout = () => dispatch => {
  localStorage.removeItem('jwtToken');
  dispatch(logoutUser());
};
```

## Session reducer

Next, create the session reducer as the default export:

```js
// src/store/session.js

// ...

const initialState = {
  user: undefined
};

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_CURRENT_USER:
      return { user: action.currentUser };
    case RECEIVE_USER_LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default sessionReducer;
```

Remember to add it to your `rootReducer`:

```js
/ src/store/store.js

// ...
import session from './session';

const rootReducer = combineReducers({
  session
});

// ...
```

## Session errors

More likely than not, you will need to handle errors for other forms in your
application in addition to the session errors. Since this is the case, go ahead
and make an errors reducer to handle all of your errors:

```js
// src/store/errors.js

import { combineReducers } from 'redux';
import { sessionErrorsReducer } from './session';

export default combineReducers({
  session: sessionErrorsReducer
});
```

**Don't forget to add this errors reducer to the root reducer.**

Next, create and export the `sessionErrorsReducer` in __store/session.js__. When
you receive a new set of session errors, you want to replace the old errors in
the state. If you successfully log the user in, you want to clear the session
errors. You should also clear the session errors if you receive an explicit
action to clear the errors:

```js
// src/store/session.js

// ...

const nullErrors = null;

export const sessionErrorsReducer = (state = nullErrors, action) => {
  switch(action.type) {
    case RECEIVE_SESSION_ERRORS:
      return action.errors;
    case RECEIVE_CURRENT_USER:
    case CLEAR_SESSION_ERRORS:
      return nullErrors;
    default:
      return state;
  }
};

// ...
```

Good job! **Commit your code** before heading to Phase 6, where you will create
your session forms.