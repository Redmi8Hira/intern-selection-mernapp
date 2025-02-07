const { register, login, getUsers } = require("../Controllers/AuthController");
const { registrationValidation, loginValidation } = require("../Middlewares/AuthValidation");
const ensureAuthenticated = require("../Middlewares/Auth");

const router = require("express").Router();

router.post('/login', loginValidation, login);
router.post('/register', registrationValidation, register);
router.get('/users', ensureAuthenticated, getUsers);

module.exports = router;