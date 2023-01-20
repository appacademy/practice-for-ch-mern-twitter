# Express Error-handling

By default, Express will return server error messages as HTML. However, since
you are building a web API that returns JSON, your Express server should also
return error messages as JSON.

To do this, you will need to add two more Express middleware:

1. A custom middleware that will create and throw a `404 Not Found` error when
   no request gets matched with a route handler.
2. A custom error-handling middleware that will format the error thrown
   somewhere in the Express function chain and return the error information as
   JSON.

First, add `const debug = require('debug');` to the other imports at the top of
__app.js__. You will configure this debugger to render error messages to the
console below.

Next, add the following code at the end of __app.js__, just before you export
the Express application (`module.exports = app`):

```js
// backend/app.js

// ...

// Express custom middleware for catching all unmatched requests and formatting
// a 404 error to be sent as the response.
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.statusCode = 404;
  next(err);
});

const serverErrorLogger = debug('backend:error');

// Express custom error handler that will be called whenever a route handler or
// middleware throws an error or invokes the `next` function with a truthy value
app.use((err, req, res, next) => {
  serverErrorLogger(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    statusCode,
    errors: err.errors
  })
});

module.exports = app;
```

Now, use Postman to try accessing an endpoint that won't get matched with a
route handler, e.g., `GET /whatever`.

You should see the following JSON response:

```json
{
  "message": "Not Found",
  "statusCode": 404
}
```

The status code of the response should also be `404`, not `200`. Finally, check
your server console: the error should be reported there, too.

Congratulations! You've finished the general setup of your app. You know what to
do now: **commit your code!**