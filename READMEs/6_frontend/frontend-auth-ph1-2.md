# Frontend Auth

In this section you'll set up the Redux cycle for frontend auth in a way that is
familiar to you from the Full Stack Project. This part of the tutorial will
accordingly move pretty quickly through some sections and not focus on the
minute details of Redux.

## Phase 1 - `jwtFetch`

Start out by ensuring that you send your authorization token with every request.
To do this, you are going to write a `jwtFetch` function that calls `fetch` with
the token inserted into the header of every request. Your code will then call
`jwtFetch`. (This is hopefully a familiar pattern.)

Create a new file in your __frontend/src/store__ directory called __jwt.js__.
Write your `jwtFetch` function inside and make it the default export:

```js
// frontend/src/store/jwt.js

async function jwtFetch(url, options = {}) {
  // Set options.method to 'GET' if there is no method.
  options.method = options.method || "GET";
  // Set options.headers to an empty object if there is no headers.
  options.headers = options.headers || {};
  // Set the "Authorization" header to the value of "jwtToken" in localStorage.
  // Remember to add 'Bearer ' to the front of the token.
  const jwtToken = localStorage.getItem("jwtToken");
  if (jwtToken) options.headers["Authorization"] = 'Bearer ' + jwtToken;
  
  // If the options.method is not 'GET', then set the "Content-Type" header to
  // "application/json".
  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] =
      options.headers["Content-Type"] || "application/json";
  }

  // Call fetch with the url and the updated options hash.
  const res = await fetch(url, options);

  // If the response status code is 400 or above, then throw an error with the
  // error being the response.
  if (res.status >= 400) throw res;

  // If the response status code is under 400, then return the response to the
  // next promise chain.
  return res;
}

export default jwtFetch;
```

You also want to include the CSRF token in your request, which means setting the
`CSRF-Token` header with the value stored in the `CSRF-TOKEN` sent up from your
backend. To do this, first write a helper function to return the value of the
particular cookie you want to access:

```js
// store/jwt.js

function getCookie(cookieName) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name.trim() === cookieName) return value;
  }
  return null;
}
```

Next, modify your `jwtFetch` function to use `getCookie` to set the `CSRF-Token`
header for non-`GET` requests:

```js
// store/jwt.js

  // ...

  // If the options.method is not 'GET', then set the "Content-Type" header to
  // "application/json" and the "CSRF-Token" header to the value stored in the
  // "CSRF-TOKEN" cookie.
  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] =
      options.headers["Content-Type"] || "application/json";
    options.headers["CSRF-Token"] = getCookie("CSRF-TOKEN");
  }
```

Now your custom fetch takes care of both JWT and CSRF tokens for you!

## Phase 2: `AuthRoute` and `ProtectedRoute`

Let's create your own custom components to set up Auth and Protected routes.
Start by adding a __Routes__ folder to your __components__ directory with a
__Routes.js__ file inside.

Write an `AuthRoute` component that takes in a component and route information.
It should return a `Route` to the component if no one is logged in and a `Route`
to the tweets index otherwise. Then write a `ProtectedRoute` component that does
the reverse, returning a `Route` to the component if the user is logged in and a
`Route` to the login page otherwise.

Here is an example of code that will do this:

```js
// src/components/Routes/Routes.js

import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const AuthRoute = ({ component: Component, path, exact }) => {
  const loggedIn = useSelector(state => !!state.session.user);

  return (
    <Route path={path} exact={exact} render={(props) => (
      !loggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect to="/tweets" />
      )
    )} />
  );
};

export const ProtectedRoute = ({ component: Component, ...rest }) => {
  const loggedIn = useSelector(state => !!state.session.user);

  return (
    <Route
      {...rest}
      render={props =>
        loggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};
```

Your `ProtectedRoute` component will ensure that users can only access certain
routes/information if they are logged in. The `AuthRoute` component will keep a
user from visiting the login or signup page if they are already logged in.

Great job! You're ready to start setting up your routes in Phase 3. Before you
move on, though, remember to **commit your code!**