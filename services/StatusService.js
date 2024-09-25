const db = require('../models');
const { QueryTypes } = require('sequelize');

class StatusService {
    constructor(db) {
        this.client = db.sequelize;
        this.Status = db.Status;
    };

    async InsertData() {
        return await db.sequelize.query("INSERT INTO Statuses (status) VALUES ('Not Started'), ('Started'), ('Completed'), ('Deleted');", {
            raw: true,
            type: QueryTypes.INSERT
        }).catch(function (err) {
            console.log(err);
        });
    };

    async getOne(statusid) {
        return this.Status.findOne({
            where: {
                id: statusid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    async getAll() {
        return this.Status.findAll({
            where: {}
        }).catch(function (err) {
            console.log(err);
        });
    };
};

module.exports = StatusService;