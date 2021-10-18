const { check } = require('express-validator');

exports.signupValidation = [
    check('nom_user', 'Name is requied').not().isEmpty(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
]

exports.loginValidation = [
    check('nom_user', 'Please include a valid email').not().isEmpty(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
]