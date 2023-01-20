# Frontend Auth, Phase 6: Session Forms

Next, create forms for your users to sign up or log in. Under __components__,
create a __SessionForms__ folder to contain your `SignupForm` and `LoginForm`
file(s). `SignupForm` should have fields for an email, username, and 2 passwords
(the second to confirm); `LoginForm` only needs email and password. The two are
similar enough that you could combine them into a single `SessionForm` component
that handles their differences with conditionals. The code example below,
however, keeps them distinct.

You want to provide feedback to users who enter incorrect information into the
form. To create a good user experience, it is helpful to display any error
messages next to the field that generated the error. Accordingly, before each of
your fields, include an `errors` `div` tied to that particular field, e.g.,

```js
<div className="errors">{errors?.email}</div>
```

You can then style your errors--having them print in red, for example--in
__src/index.css__ so that they always appear with the same distinctive style.
Giving these `div`a specific height can also keep your form elements from
jumping around when errors appear. You could do something like this:

```css
form > .errors {
  color: red;
  font-size: 0.875em;
  height: 15px;
  display: flex;
  align-items: center;
}
```

You want to make sure you clear the errors whenever someone successfully logs
in; your `RECEIVE_CURRENT_USER` case in the `sessionErrorsReducer` takes care of
this. You also want to clear the errors, however, if a user navigates away from
the page and then comes back: you never want a user to navigate to the login or
signup page and see old errors from a previous attempt! To avoid this situation,
create a cleanup function in a `useEffect` that will clear the errors whenever
the component unmounts:

```js
useEffect(() => {
  return () => {
    dispatch(clearSessionErrors());
  };
}, [dispatch]);
```

Using these tips, try to construct the Login and Signup forms yourself. If you
get stuck, check out the code below.

```js
// src/components/SessionForms/LoginForm.js

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './SessionForm.css';

import { login, clearSessionErrors } from '../../store/session';

function LoginForm () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const errors = useSelector(state => state.errors.session);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearSessionErrors());
    };
  }, [dispatch]);

  const update = (field) => {
    const setState = field === 'email' ? setEmail : setPassword;
    return e => setState(e.currentTarget.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password })); 
  }

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      <h2>Log In Form</h2>
      <div className="errors">{errors?.email}</div>
      <label>
        <span>Email</span>
        <input type="text"
          value={email}
          onChange={update('email')}
          placeholder="Email"
        />
      </label>
      <div className="errors">{errors?.password}</div>
      <label>
        <span>Password</span>
        <input type="password"
          value={password}
          onChange={update('password')}
          placeholder="Password"
        />
      </label>
      <input
        type="submit"
        value="Log In"
        disabled={!email || !password}
      />
    </form>
  );
}

export default LoginForm;
```

```js
// src/components/SessionForms/SignupForm.js

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './SessionForm.css';
import { signup, clearSessionErrors } from '../../store/session';

function SignupForm () {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const errors = useSelector(state => state.errors.session);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearSessionErrors());
    };
  }, [dispatch]);

  const update = field => {
    let setState;

    switch (field) {
      case 'email':
        setState = setEmail;
        break;
      case 'username':
        setState = setUsername;
        break;
      case 'password':
        setState = setPassword;
        break;
      case 'password2':
        setState = setPassword2;
        break;
      default:
        throw Error('Unknown field in Signup Form');
    }

    return e => setState(e.currentTarget.value);
  }

  const handleSubmit = e => {
    e.preventDefault();
    const user = {
      email,
      username,
      password
    };

    dispatch(signup(user)); 
  }

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      <h2>Sign Up Form</h2>
      <div className="errors">{errors?.email}</div>
      <label>
        <span>Email</span>
        <input type="text"
          value={email}
          onChange={update('email')}
          placeholder="Email"
        />
      </label>
      <div className="errors">{errors?.username}</div>
      <label>
        <span>Username</span>
        <input type="text"
          value={username}
          onChange={update('username')}
          placeholder="Username"
        />
      </label>
      <div className="errors">{errors?.password}</div>
      <label>
        <span>Password</span>
        <input type="password"
          value={password}
          onChange={update('password')}
          placeholder="Password"
        />
      </label>
      <div className="errors">
        {password !== password2 && 'Confirm Password field must match'}
      </div>
      <label>
        <span>Confirm Password</span>
        <input type="password"
          value={password2}
          onChange={update('password2')}
          placeholder="Confirm Password"
        />
      </label>
      <input
        type="submit"
        value="Sign Up"
        disabled={!email || !username || !password || password !== password2}
      />
    </form>
  );
}

export default SignupForm;
```

You did it! At this point, you should be able to sign up, log in, and log out a
user. If a user provides invalid information on a session form, the errors
should be rendered to the user.

There's just one more piece to finish off your frontend auth.

## `getCurrentUser`

Finally, create a thunk action to get the current user:

```js
// store/session.js

export const getCurrentUser = () => async dispatch => {
  const res = await jwtFetch('/api/users/current');
  const user = await res.json();
  return dispatch(receiveCurrentUser(user));
};
```

Call this in `App` to make sure that the current user is loaded before
rendering:

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
      </Switch>
    </>
  );
}
```

Well done! In the next section, you will finish your frontend by adding the
ability for your users to view and compose tweets.

Psst... now would be a great time to **commit your code!**