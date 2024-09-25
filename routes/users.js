var express = require('express');
var router = express.Router();
var jsend = require('jsend');
router.use(jsend.middleware);

var crypto = require('crypto');
var db = require('../models');
var UserService = require('../services/UserService');
var userService = new UserService(db);

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var jwt = require('jsonwebtoken');

const { isAuth } = require('../middleware/middleware');

// Post for registered users to be able to login
router.post('/login', jsonParser, async (req, res, next) => {
			
	// #swagger.tags = ['Login']
	// #swagger.description = "Logins a user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const { email, password } = req.body;
	if (email == null && password != null) {
		return res.jsend.fail({"statusCode": 400, "email": "Email is required!"});
	};
	if (email != null && password == null) {
		return res.jsend.fail({"statusCode": 400, "password": "Password is required!"})
	};
	if (email == null && password == null) {
		return res.jsend.fail({"statusCode": 400, "email": "Email is required!", "password": "Password is required!"})
	};
	userService.getOne(email).then((data) => {
		if(data === null) {
			return res.jsend.fail({"statusCode": 400, "result": "Incorrect email or password!"});
		};
		crypto.pbkdf2(password, data.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
			if (err) { return cb(err); };
			if (!crypto.timingSafeEqual(data.encryptedPassword, hashedPassword)) {
				return res.jsend.fail({"statusCode": 400, "result": "Incorrect email or password!"});
			};
			try {
				token = jwt.sign(
					{ id: data.id, email: data.email },
					process.env.TOKEN_SECRET,
					{ expiresIn: "1h" }
				);
			} catch (err) {
				res.jsend.error("Something went wrong with creating JWT token!")
			}
			res.jsend.success({"statusCode": 200, "result": "You are now logged in.", "id": data.id, "email": data.email, "token": token})
		});
	});
});

// Post for new users to register / signup
router.post('/signup', async (req, res, next) => {
				
	// #swagger.tags = ['Signup']
	// #swagger.description = "Signs up a user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const {name, email, password} = req.body;
	if (name == null) {
		return res.jsend.fail({"statusCode": 400, "name": "Name is required!"});
	};
	if (email == null) {
		return res.jsend.fail({"statusCode": 400, "email": "Email is required!"});
	};
	if (password == null) {
		return res.jsend.fail({"statusCode": 400, "password": "Password is required!"});
	};
	var user = await userService.getOne(email);
	if (user != null) {
		return res.jsend.fail({"statusCode": 400, "email": "Provided email is already in use!"});
	};
	var salt = crypto.randomBytes(16);
	crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
		if(err) { return next(err); }
		userService.create(name, email, hashedPassword, salt);
		res.jsend.success({"statusCode": 200, "result": "You created an account."})
	});
});

router.delete('path', isAuth, async (req, res, next) => {
				
	// #swagger.tags = ['Delete']
	// #swagger.description = "Deletes a user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	let email = req.body.email;
	if(email == null) {
		return res.jsend.fail({"statusCode": 400, "email": "Email is reuqired!"});
	};
	var user = await userService.getOne(email);
	if (user == null) {
		return res.jsend.fail({"statusCode": 400, "user": "No users were found!"});
	}
	await userService.delete(email);
	res.jsend.success({"statusCode": 200, "result": "You deleted an account!"})
});

router.get('/fail', isAuth, (req, res) => {
					
	// #swagger.tags = ['Optional']
	// #swagger.description = "Tests fail error messages."
	// #swagger.responses = [401]

	return res.status(401).jsend.error({ statusCode: 401, message: 'message', data: 'data' });
});

module.exports = router;

