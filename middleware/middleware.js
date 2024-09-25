const db = require('../models');
const { QueryTypes } = require('sequelize');
var StatusService = require('../services/StatusService');
var statusService = new StatusService(db);

var jwt = require('jsonwebtoken');


module.exports = {
	// Middleware function to determine if the API endpoint request is from an authenticated user
	isAuth: function(req, res, next) {
		const token = req.headers.authorization?.split(' ')[1];
		if(!token) {
			return res.jsend.fail({"statusCode": 400, "result": "JWT token not provided!"});
		}
		let decodedToken;
		try {
			decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		}
		catch(err) {
			return res.jsend.fail({"result": err});
		}
		next();
	},
	checkIfStatusTableHasData: async function(req, res, next) {
		let statuses = await db.sequelize.query('SELECT COUNT(*) AS Total FROM Statuses', {
			raw: true,
			type: QueryTypes.SELECT
		});
		if (statuses[0].Total == 0) {
			console.log('No records found, populating the Status table...');
			await statusService.InsertData();
		} else {
			console.log('No records added, the Status table is already populated!');
		}
		next();
		return;
	}
};