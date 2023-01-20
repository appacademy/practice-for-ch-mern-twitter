# Validations

Before starting this section, review the documentation for [express-validator].

`express-validator` offers an easy way to validate the body of a request.

* Create a new folder in your __backend__ directory called __validations__.
* Inside the __validations__ folder, create three new files: __login.js__,
  __register.js__, and __handleValidationErrors.js__. The first two files will
  contain your validations. The third will contain a custom function to
  return errors if any of the validations fail.

```js
// validations/handleValidationErrors.js

const { validationResult } = require("express-validator");

// handleValidationErrors is an Express middleware used with the `check`
// middleware to format the validation errors. (To customize,
// see express-validator's documentation.)
const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errorFormatter = ({ msg }) => msg;
    const errors = validationErrors.formatWith(errorFormatter).mapped();

    const err = Error("Validation Error");
    err.errors = errors;
    err.statusCode = 400;
    err.title = "Validation Error";
    next(err);
  }
  next();
};

module.exports = handleValidationErrors;
```

Following the documentation for validator, set up the validations for user login
and registration. Also, import and add the `handleValidationErrors` as the last
middleware. Your finished login validations should resemble this:

```js
// validations/login.js

const { check } = require("express-validator");
const handleValidationErrors = require('./handleValidationErrors');

// validateLoginInput is a combination Express middleware that uses the `check`
// middleware to validate the keys in the body of a request to login a user
const validateLoginInput = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Email is invalid'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6, max: 30 })
    .withMessage('Password must be between 6 and 30 characters'),
  handleValidationErrors
];

module.exports = validateLoginInput;
```

Your new registration validation should resemble this:

```js
// validations/register.js

const { check } = require("express-validator");
const handleValidationErrors = require('./handleValidationErrors');

// validateRegisterInput is a combination Express middleware that uses the 
// `check` middleware to validate the keys in the body of a request to 
// register a user
const validateRegisterInput = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Email is invalid'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 2, max: 30 })
    .withMessage('Username must be between 2 and 30 characters'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6, max: 30 })
    .withMessage('Password must be between 6 and 30 characters'),
  handleValidationErrors
];

module.exports = validateRegisterInput;
```

In your users route, import your newly created validations:

```js
// routes/api/users.js

const validateRegisterInput = require('../../validations/register');
const validateLoginInput = require('../../validations/login');
```

Now, before the `/register` route handler callback function argument, add the
`validateRegisterInput` as an argument:

```js
// POST /api/users/register
router.post('/register', validateRegisterInput, async (req, res, next) => {
  // ...
});
```

Repeat the process for the `login` route:

```js
// POST /api/users/login
router.post('/login', validateLoginInput, async (req, res, next) => {
  // ...
});
```

Try to register a new user in Postman with a duplicated username. This should
return the corresponding error message you specified earlier. Test out the
various other registration scenarios--mismatched passwords, invalid email
addresses, and so on--to make sure your validations are working correctly for
both registration and login.

With validations complete, you just need to implement tweet functionality to
complete your backend. (Psst... **commit your code!**)

[express-validator]: https://express-validator.github.io/docs/