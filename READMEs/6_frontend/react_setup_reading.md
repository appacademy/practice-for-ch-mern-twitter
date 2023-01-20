# React Setup

Before starting this section, review the [Create React App user guide][cra].

It's time to set up the frontend of your application!

- If you have not already done so at some point, run
  
  ```sh
  npm install -g create-react-app
  ```
  
  in your terminal to install `create-react-app` globally.

> **Note:** Although the official `create-react-app` [documentation][cra] no
> longer recommends installing a global version of `create-react-app`, App
> Academy still recommends that you install it globally. This is because App
> Academy also encourages you to use `nvm` (Node Version Manager) to manage
> versions of Node.js. If you run `npx create-react-app` (see below) without
> having first installed `create-react-app` globally, then `nvm` will cache the
> version that you run. This cached version effectively gets treated as a global
> installation, but, because it is hidden by `nvm`, it is a global installation
> that is difficult to find and update. Accordingly, when new `create-react-app`
> releases appear, the cached version can cause hard-to-resolve version
> conflicts that will prevent `create-react-app` from running. A true global
> version, in contrast, can be updated simply by re-running the `npm`
> installation command.
>
> TL;DR: Installing `create-react-app` globally enables you to easily update and
> maintain the `create-react-app` version that you are using with `nvm`.

- In the **root directory** of your project, run
  
  ```sh
  npx create-react-app frontend --template @appacademy/react-v17 --use-npm
  ```

  to install a new React application in a new folder called __frontend__.

  Your folder structure should now look like this:

  ```plaintext
    <root>
      ├── backend
      └── frontend
  ```

  Note that **this structure is different from the structure that you used for
  your Full Stack Project**, where the __frontend__ folder was inside the
  __backend__ folder. In this project, __frontend__ and __backend__ are distinct
  directories at the same level.

- `cd` into your __frontend__ folder and `npm install` your standard Redux and
  Router packages:
  - `react-redux` - React components and hooks for Redux
  - `react-router-dom@^5` - routing for React
  - `redux` - Redux
  - `redux-thunk` - Redux thunk

- Also install `redux-logger` as a `devDependency` (so it won't be included in
  production):

  ```sh
  npm install -D redux-logger
  ```

- When setting up routes for your React app, you want to be able to write
  something like `/api/users/:id` rather than having to type the full path. To
  enable this, add a `proxy` key-value pair to the __package.json__ **in
  your __frontend__ folder**:
  
  ```json
  "proxy": "http://localhost:5000"
  ```

- Finally, open __frontend/public/index.html__ and change the `title` from
  `React Template` to `Chirper`.

## File Structure

Since you have already covered React earlier in the App Academy curriculum, this
tutorial will not do a deep dive into React or Redux. It will, however, walk
through the steps of setting up the Redux cycle so that you can authenticate
users, access tweets, and view a single user's tweets.

Start by adding __components__ and __store__ folders to the __frontend/src__
directory.

## Store

Let's configure the Redux store. This step should be familiar to you after your
experience with the Full Stack Project earlier in the curriculum.

Within the __store__ directory, create a new file called __store.js__:

```js
// store/store.js

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
  
});

let enhancer;

if (process.env.NODE_ENV === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require('redux-logger').default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
```

As you likely recall, this code sets up the Redux DevTools and `logger`
middleware to run in non-`production` environments. It also configures your
store with the possibility of passing in a preloaded state.

## Entry file

Conclude this setup by configuring your entry file, __src/index.js__. Create a
`Root` component that wraps `App`--which you will create soon!--in the Redux
`Provider` and in React-Router's `BrowserRouter`. It should look something like
this:

```js
// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from './store/store';

let store = configureStore({});

function Root() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);
```

Your frontend is all set up! **Commit your code** and head on to Frontend Auth,
Phase 1.

[cra]: https://create-react-app.dev/docs/getting-started