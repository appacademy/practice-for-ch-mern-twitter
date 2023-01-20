# Deploying Your Express + React App To Render.com

Before you begin deploying, **make sure to remove any `console.log`s or
`debugger`s in any production code**. Search your entire project folder to see
if you are using them anywhere.

You will set up [Render.com] to run a production, not development, version of
your application. In the following phases, you will accordingly configure your
application to work in production and configure your root __package.json__
`install`, `build`, and `start` scripts to install, build your React
application, and start the Express production server.

If you do not yet have a Render account, sign up for one [here][render-signup].

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

The next thing you need to do is to set up your app so that Render will be able
to build it. To that end, go to the root directory and run `npm init -y`. Open
the __package.json__ file that this creates in your root directory and fill in
the various descriptive fields--"name", "description", "author"--with
appropriate values. You can also delete the "main" entry.

Next, add an `"engines"` key that specifies the version of Node to use. (Run
`node -v` in your terminal to see what version you are using.) It is recommended
to specify only the major version, leaving Render free to install the latest
compatible minor version (which often contains security updates). It should look
something like this:

```json
  "engines": {
    "node": "16.x"
  },
```

> For alternative ways of specifying the Node version on Render, see
> [here][render-node].

You also need to add scripts to your package. By cleverly defining the scripts
in your root __package.json__, you can effectively get Render to run scripts in
your __backend__ and __frontend__ folders too. In this case, you want Render to
`install` the dependencies in your __backend__ and __frontend__ folders, then
`build` your __frontend__ static files.

To get Render to do this, add the following scripts to your root
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
directory.

That's it! Your codebase should be ready. Go ahead and **commit your changes.**

## Phase 2: Deploying to Render

First, create a new web service. From your Render [Dashboard], click the `New +`
button on the top right. In the resulting dropdown menu, select `Web Service`.

If you have not already connected your GitHub account, click `Connect account`
and follow the steps to connect it. Once you have connected your GitHub account,
you should see a list of your available repos. Select the repo with your app.

Fill in the `Name` field with the name of your app. You shouldn't need to
specify a `Root Directory`. Select `Node` as the runtime `Environment` if it is
not already selected. Choose the `Region` closest to you: `Ohio` if in NY,
`Oregon` if in SF. Leave the branch as `main`.

Replace the string in the `Build Command` with `npm run build && node
backend/seeders/seeds.js`.  
Replace the string in the `Start Command` with `npm start --prefix backend`.  
Select the `Free` plan.

Click `Advanced` and then `Add Environment Variables`. Create keys of
  `MONGO_URI` and `SECRET_OR_KEY`. Copy in their respective values from your
  __.env__ file.

Finally, click `Create Web Service`. This will take you to a page where you can
see the console output as your app builds. If all goes well, you should
eventually see `Build successful` followed by `Deploying...`.

## Visit your site

The web address for your site will have the form
`https://your-app-name.onrender.com`--possibly with some extra letters after
your app's name to avoid conflicts--and appear under your app's name near the
top of its web service page. Once your server is running, click your app's
address and visit it live on the web!

**Note:** It can take a couple of minutes for your site to appear, **even after
Render reports that it is `Live`.** Just be patient and refresh every 30 seconds
or so until it appears.

Unless you changed the `Auto-Deploy` setting from `Yes`, your app should rebuild
and redeploy whenever you push changes to your `main` branch. If you ever need
to trigger a manual redeployment, click the blue `Manual Deploy` button at the
top of your app's Render page. Select `Clear build cache & deploy` for a clean
redeployment from scratch. You will be able to see the logs and confirm that
your redeployment is successful.

[Render.com]: https://render.com/
[render-signup]: https://dashboard.render.com/register
[Dashboard]: https://dashboard.render.com/
[render-node]: https://render.com/docs/node-version