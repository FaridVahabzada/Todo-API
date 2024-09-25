const { Op } = require("sequelize");
class TodoService {
    constructor(db) {
        this.client = db.sequelize;
        this.Todo = db.Todo;
    };

    async getOne(todoid, userid) {
        return this.Todo.findOne({
            where: {
                id: todoid,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
    
    async getOneCategory(categoryid, userid) {
        return this.Todo.findOne({
            where: {
                CategoryId: categoryid,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    async getAllButDeleted(userid) {
        return this.Todo.findAll({
            where: {
                UserId: userid,
                StatusId: {
                    [Op.not]: 4 
                }
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
    
    async getOnlyDeleted(userid) {
        return this.Todo.findAll({
            where: {
                UserId: userid,
                StatusId: 4
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    async getAll(userid) {
        return this.Todo.findAll({
            where: {UserId: userid}
        }).catch(function (err) {
            console.log(err);
        });
    };

    async getOneByName(todoname, userid) {
        return this.Todo.findOne({
            where: {
                name: todoname,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    async create(name, description, categoryid, userid) {
        return this.Todo.create(
            {
                name: name,
                description: description,
                CategoryId: categoryid,
                StatusId: 1,
                UserId: userid
            }
        ).catch(function (err) {
            console.log(err);
        });
    };
    
    async updateTodo(todoid, name, description, categoryid, statusid, userid) {
        return this.Todo.update(
        {
            name: name,
            description: description,
            CategoryId: categoryid,
            StatusId: statusid
        },
        {
            where: {
                id: todoid,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    async deleteTodo(todoid, userid) {
        return this.Todo.update(
        {
            StatusId: 4
        },
        {
            where: {
                id: todoid,
                UserId: userid
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
};

module.exports = TodoService;