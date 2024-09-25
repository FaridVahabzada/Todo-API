var express = require('express');
var router = express.Router();
var jsend = require('jsend');
router.use(jsend.middleware);

var db = require('../models');
var TodoService = require('../services/TodoService');
var todoService = new TodoService(db);
var StatusService = require('../services/StatusService');
var statusService = new StatusService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var jwt = require('jsonwebtoken');

const { isAuth, checkIfStatusTableHasData } = require('../middleware/middleware');


/* Return all the logged in users todo's with the category associated with each todo and
status that is not the deleted status */
router.get('/', isAuth, async (req, res, next) => {

	// #swagger.tags = ['All todos but deleted']
	// #swagger.description = "Gets the list of all todos but deleted ones for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let data = await todoService.getAllButDeleted(userid);
	if (Object.keys(data).length === 0) {
		return res.jsend.fail({"statusCode": 400, "result": "No records were found!"});
	};
	res.jsend.success({"statusCode": 200, "result": data})
});

// Return all the users todos including todos with a deleted status
router.get('/all', isAuth, async (req, res, next) => {

	// #swagger.tags = ['All todos including deleted']
	// #swagger.description = "Gets the list of all todos including deleted ones for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let data = await todoService.getAll(userid);
	if (Object.keys(data).length === 0) {
		return res.jsend.fail({"statusCode": 400, "result": "No records were found!"});
	};
	res.jsend.success({"statusCode": 200, "result": data})
});

// Return all the todos with the deleted status
router.get('/deleted', isAuth, async (req, res, next) => {
	
	// #swagger.tags = ['All deleted todos']
	// #swagger.description = "Gets the list of all deleted todos for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let data = await todoService.getOnlyDeleted(userid);
	if (Object.keys(data).length === 0) {
		return res.jsend.fail({"statusCode": 400, "result": "No records were found!"});
	};
	res.jsend.success({"statusCode": 200, "result": data})
});

// Add a new todo with their category for the logged in user
router.post('/', isAuth, checkIfStatusTableHasData, jsonParser, async (req, res, next) => {
		
	// #swagger.tags = ['A new todo']
	// #swagger.description = "Creates a new todo for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]
	
	const { name, description, categoryid } = req.body;
	if (name == null) {
		return res.jsend.fail({"statusCode": 400, "name": "Name is required!"});
	};
	if (description == null) {
		return res.jsend.fail({"statusCode": 400, "description": "Description is required!"});
	};
	if (categoryid == null || !Number.isInteger(categoryid)) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "CategoryId is required & CategoryId must be an integer!"});
	};

	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let verifyTodoUniqueness = await todoService.getOneByName(name, userid);
	if (verifyTodoUniqueness != null) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "There can be no duplicate Todo names!"});
	};

	let verifyCategoryId = await categoryService.getOne(categoryid, userid);
	if (verifyCategoryId == null) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "Please, create or use a valid CategoryId!"});
	};

	await todoService.create(name, description, categoryid, userid);
	res.jsend.success({"statusCode": 200, "result": "You created a new Todo!"})
});

// Return all the statuses from the database
router.get('/statuses', isAuth, checkIfStatusTableHasData, async (req, res, next) => {
		
	// #swagger.tags = ['All statuses']
	// #swagger.description = "Gets the list of all statuses."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	let data = await statusService.getAll();
	if (Object.keys(data).length === 0) {
		return res.jsend.fail({"statusCode": 400, "result": "No records were found!"});
	};
	res.jsend.success({"statusCode": 200, "result": data});
});

// Change/update a specific todo for logged in user
router.put('/:id', isAuth, jsonParser, async (req, res, next) => {
		
	// #swagger.tags = ['Update a todo']
	// #swagger.description = "Updates or changes a todo for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	const { name, description, categoryid, statusid } = req.body;
	if (categoryid != null && !Number.isInteger(categoryid)) {
		return res.jsend.fail({"statusCode": 400, "categoryid": "CategoryId must be an integer!"});
	};
	if (statusid != null && !Number.isInteger(parseInt(statusid))) {
		return res.jsend.fail({"statusCode": 400, "statusid": "StatusId must be an integer!"});
	};

	let todoid = parseInt(req.params.id);
	if (todoid == null || !Number.isInteger(todoid)) {
		return res.jsend.fail({"statusCode": 400, "todoid": "TodoId is required & TodoId must be an integer!"});
	};
	
	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let verifyTodoId = await todoService.getOne(todoid, userid);
	if (verifyTodoId == null) {
		return res.jsend.fail({"statusCode": 400, "todoid": "Please, create or use a valid TodoId!"});
	};

	if (categoryid != null) {
		let verifyCategoryId = await categoryService.getOne(categoryid, userid);
		if (verifyCategoryId == null) {
			return res.jsend.fail({"statusCode": 400, "categoryid": "Please, create or use a valid CategoryId!"});
		};
	};

	if (statusid != null) {
		let verifyStatusId = await statusService.getOne(statusid);
		if (verifyStatusId == null) {
			return res.jsend.fail({"statusCode": 400, "statusid": "Please, create or use a valid StatusId!"});
		};
	};

	await todoService.updateTodo(todoid, name, description, categoryid, statusid, userid);
	res.jsend.success({"statusCode": 200, "result": "This Todo has been updated now!"})
});

router.delete('/:id', isAuth, async (req, res, next) => {
		
	// #swagger.tags = ['Delete a todo']
	// #swagger.description = "Sets the status of a todo to 'Deleted' for the logged-in user."
	// #swagger.responses = [200]
	// #swagger.responses = [400]

	let todoid = parseInt(req.params.id);
	if (todoid == null || !Number.isInteger(todoid)) {
		return res.jsend.fail({"statusCode": 400, "todoid": "TodoId is required & TodoId must be an integer!"});
	};

	const token = req.headers.authorization?.split(' ')[1];
    let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    let userid = decodedToken.id;

	let verifyTodoId = await todoService.getOne(todoid, userid);
	if (verifyTodoId == null) {
		return res.jsend.fail({"statusCode": 400, "todoid": "Please, create or use a valid TodoId!"});
	};

	await todoService.deleteTodo(todoid, userid);
	res.jsend.success({"statusCode": 200, "result": "This Todo's status is now set to 'Deleted'!"})
});

module.exports = router;

