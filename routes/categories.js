var express = require('express');
var router = express.Router();
var jsend = require('jsend');
router.use(jsend.middleware);

var db = require('../models');
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var TodoService = require('../services/TodoService');
var todoService = new TodoService(db);

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var jwt = require('jsonwebtoken');

const { isAuth } = require('../middleware/middleware');


/* Return all the logged-in user's categories*/
router.get('/', isAuth, async (req, res, next) => {
		
	// #swagger.tags = ['All categories']
	// #swagger.description = "Gets the list of all categories for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let data = await categoryService.getAll(userid);
	if (Object.keys(data).length === 0) {
		return res.jsend.fail({"statusCode": 400, "result": "No records were found!"});
	};
	res.jsend.success({"statusCode": 200, "result": data})
});

// Add a new category for the logged-in user
router.post('/', isAuth, jsonParser, async (req, res, next) => {
			
	// #swagger.tags = ['A new category']
	// #swagger.description = "Creates a new category for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const { name } = req.body;
    if (name == null) {
		return res.jsend.fail({"statusCode": 400, "name": "Name is required!"});
	};
    
    const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let verifyCategoryUniqueness = await categoryService.getOneByName(name, userid);
	if (verifyCategoryUniqueness != null) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "There can be no duplicate Category names!"});
	};

	await categoryService.create(name, userid);
	res.jsend.success({"statusCode": 200, "result": "You created a new Category!"})
});

// Change/update a specific category for logged-in user
router.put('/:id', isAuth, jsonParser, async (req, res, next) => {
			
	// #swagger.tags = ['Update a category']
	// #swagger.description = "Updates or changes a category for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const { name } = req.body;

	let categoryid = parseInt(req.params.id);
	if (categoryid == null || !Number.isInteger(categoryid)) {
		return res.jsend.fail({"statusCode": 400, "todoid": "TodoId is required & TodoId must be an integer!"});
	};
	
	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let verifyCategoryId = await categoryService.getOne(categoryid, userid);
	if (verifyCategoryId == null) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "Please, create or use a valid CategoryId!"});
	};

	await categoryService.updateCategory(categoryid, name, userid);
	res.jsend.success({"statusCode": 200, "result": "This Category has been updated now!"})
});

// Delete a specific category for the logged-in user
router.delete('/:id', isAuth, async (req, res, next) => {
			
	// #swagger.tags = ['Delete a category']
	// #swagger.description = "Deletes a category for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	let categoryid = parseInt(req.params.id);
	if (categoryid == null || !Number.isInteger(categoryid)) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "CategoryId is required & CategoryId must be an integer!"});
	};

	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let verifyTodoCategoryId = await todoService.getOneCategory(categoryid, userid);
	if (verifyTodoCategoryId != null) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "This category is in use now! Please, choose a different one!"});
	};

	let verifyCategoryId = await categoryService.getOne(categoryid, userid);
	if (verifyCategoryId == null) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "Please, create or use a valid CategoryId!"});
	};

	await categoryService.deleteCategory(categoryid, userid);
	res.jsend.success({"statusCode": 200, "result": "This Category is now deleted!"})
});

module.exports = router;

