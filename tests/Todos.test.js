const express = require('express');
const request = require('supertest');

const app = express();
require('dotenv').config();

const bodyParser = require('body-parser');

var usersRouter = require('../routes/users');
var todosRouter = require('../routes/todos');
var categoriesRouter = require('../routes/categories');

app.use(bodyParser.json());
app.use('/users', usersRouter);
app.use('/todos', todosRouter);
app.use('/categories', categoriesRouter);

var db = require('../models');
var TodoService = require('../services/TodoService');
var todoService = new TodoService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var UserService = require('../services/UserService');
var userService = new UserService(db);



describe('testing-scenarios', () => {

    test("POST /users/signup - success", async () => {
        const credentials = {
            name: "testUser",
            email: "test@test.com",
            password: "test"
        };
        const { body } = await request(app).post("/users/signup").send(credentials);
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("result");
        expect(body.data.result).toBe("You created an account.");
        const user = await userService.getOne("test@test.com"); // This line helps to get this test finalised, so others can catch up to.
    });

    let token;
    let userid;
    test("POST /users/login - success", async () => {
        const credentials = {
            email: "test@test.com",
            password: "test"
        };
        const { body } = await request(app).post("/users/login").send(credentials);
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("token");
        token = body.data.token;
        userid = body.data.id;
    });

    test("GET /todos/all - success", async () => {
        const { body } = await request(app).get("/todos/all").set('Authorization', 'Bearer ' + token);
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("result");
        expect(body.data.result).toBe("No records were found!");
    });

    let todoId;
    test("POST /todos - success", async () => {
        const newCategory = {
            "name": "test"
        }
        await request(app).post("/categories").set('Authorization', 'Bearer ' + token).send(newCategory);
        const categoryId = await categoryService.getOneByName("test", userid).then((data) => {return parseInt(data.id);});
        const newTodo = {
            "name": "test",
            "description": "test",
            "categoryid": categoryId
        }
        const { body } = await request(app).post("/todos").set('Authorization', 'Bearer ' + token).send(newTodo);
        todoId = await todoService.getOneByName("test", userid).then((data) => {return parseInt(data.id);});
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("result");
        expect(body.data.result).toBe("You created a new Todo!");
    });

    test("DELETE /todos/1 - success", async () => {
        const { body } = await request(app).delete(`/todos/${todoId}`).set('Authorization', 'Bearer ' + token);
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("result");
        expect(body.data.result).toBe("This Todo's status is now set to 'Deleted'!");
    });

    test("GET /todos/all - fail", async () => { // Here fail used to emphasize the status to be recieved
        const { body } = await request(app).get("/todos/all");
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("result");
        expect(body.data.result).toBe("JWT token not provided!");
    });

    test("GET /todos/all - fail", async () => { // Here fail used to emphasize the status to be recieved
        const { body } = await request(app).get("/todos/all").set('Authorization', 'Bearer ' + "RandomStuff");
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("result");
        expect(body.data.result.message).toBe("jwt malformed");
    });
});