# Deploying Your Express + React App To Heroku

Before you begin deploying, **make sure to remove any `console.log`s or
`debugger`s in any production code**. Search your entire project folder to see
if you are using them anywhere.

You will set up Heroku to run a production, not development, version of your
application. When a Node.js application is pushed to Heroku, Heroku identifies
it as a Node.js application because of the __package.json__ file in the root
directory. It will accordingly run the Node.js buildpack automatically. This
means that it will automatically run `npm install` in your root directory.
Then, if there is a `build` script in the __package.json__ file, it will run
that script too. Afterwards, it will automatically run `npm start`.

In the following phases, you will configure your application to work in
production, not just in development, and configure your root __package.json__
`install`, `build`, and `start` scripts to install, build your React
application, and start the Express production server.

## Phase 1: Setting up your Express + React application

Right now, your React application is on a different localhost port (3000) than
your Express application (5000). However, since your React application consists
only of static files that don't need to bundled continuously with changes in
production, your Express application can serve the React assets in production
too. These static files live in the __frontend/build__ folder after running `npm
run build` in the __frontend__ folder. You want to tell Express to serve up
these frontend files for any non-`/api` route.

To accomplish this, you need to adjust your __backend/app.js__ file. In brief,
you want to serve the React application's static __index.html__ file (along with
the `CSRF-TOKEN` cookie!) at the root route. Then serve up all the React
application's static files using the `express.static` middleware. Finally, serve
the __index.html__ and set the `CSRF-TOKEN` cookie again on all routes that
don't start in `/api`. Adding this functionality will look like this:

```js
// backend/app.js

// ...
// These lines should already be present.
app.use('/api/tweets', tweetsRouter);
app.use('/api/users', usersRouter);
app.use('/api/csrf', csrfRouter);

// Serve static React build files statically in production
if (isProduction) {
  const path = require('path');
  // Serve the frontend's index.html file at the root route
  app.get('/', (req, res) => {
    res.cookie('CSRF-TOKEN', req.csrfToken());
    res.sendFile(
      path.resolve(__dirname, '../frontend', 'build', 'index.html')
    );
  });

  // Serve the static assets in the frontend's build folder
  app.use(express.static(path.resolve("../frontend/build")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  app.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('CSRF-TOKEN', req.csrfToken());
    res.sendFile(
      path.resolve(__dirname, '../frontend', 'build', 'index.html')
    );
  });
}
```

The next thing you need to do is to set up your app so that Heroku will
recognize it as a Node.js project. To that end, go to the root directory and run
`npm init -y`. Open the __package.json__ file that this creates in your root
directory and fill in the various descriptive fields--"name", "description",
"author"--with appropriate values. You can also delete the "main" entry.

Next, add an `"engines"` key that specifies the version of Node to use. (Run
`node -v` in your terminal to see what version you are using.) Heroku recommends
specifying only the major version, leaving it free to install the latest
compatible minor version (which often contains security updates). It should look
something like this:

```json
  "engines": {
    "node": "16.x"
  },
```

You also need to add scripts to your package. By default, the Heroku buildpack
will only run scripts (`install`, `build`, etc.) in the root directory. By
cleverly defining the scripts in your root __package.json__, however, you can
effectively get Heroku to run scripts in your __backend__ and __frontend__
folders too. In this case, you want Heroku to `install` the dependencies in your
__backend__ and __frontend__ folders, then `build` your __frontend__ static
files.

To get Heroku to do this, add the following scripts to your root
__package.json__:

```json
  "scripts": {
    "backend-install": "npm install --prefix backend",
    "backend": "npm run dev --prefix backend",
    "frontend-install": "npm install --prefix frontend",
    "frontend": "npm start --prefix frontend",
    "frontend-build": "npm run build --prefix frontend",
    "build": "npm run backend-install && npm run frontend-install && npm run frontend-build"
  },
```

(The `backend` and `frontend` scripts are not strictly necessary, but you might
find them useful for running in development.)

Finally, add a __.gitignore__ that includes `node_modules` in your root
directory. Then create a __Procfile__ containing `web: npm start --prefix
backend` in your root directory. This tells Heroku to start your web server by
running `npm start` in the __backend__ directory.

That's it! Your codebase should be ready. Go ahead and **commit your changes.**

## Phase 2: Setting up Heroku

First, create a new app. From the Heroku [dashboard] in your browser, click
`New` > `Create a new app`. Give your app a unique name, and don't change the
region. Click `Create app`.

Next add your config vars / environment variables:

- Go to the `Settings` tab in your newly created app's dashboard.
- Look for the `Config Vars` section, and click `Reveal Config Vars`.
- Create keys of `MONGO_URI` and `SECRET_OR_KEY`. Copy in their respective
  values from your __.env__ file.

Finally, click on the `Deploy` tab and scroll down to the `Existing Git
repository` section at the bottom of the page. Copy the code used to add the
heroku remote. (It will look like `heroku git:remote -a <your-app-name>`). Paste
it into your terminal and run it.

## Phase 3: Deploy to Heroku

You're almost there! Make sure you are on the `main` branch, then push to
Heroku:

```bash
git push heroku main
```

When all of your scripts have finished building, run `heroku open` to see your
app in the browser. You are still using your MongoDB Atlas database, so you
should be able to log in with users you have already created. Test your app and
make sure all of your functionality is still present.

If everything works as expected, congratulations! Your MERN application is
live on Heroku!

If you see an `Application Error` or are experiencing different behavior than
what you see in your local environment, check the logs by running:

```bash
heroku logs
```

If you want to open a connection to the logs to continuously output to your
terminal, then run:

```bash
heroku logs --tail
```

The logs may clue you into why you are experiencing errors or different
behavior.

[dashboard]: https://dashboard.heroku.com/