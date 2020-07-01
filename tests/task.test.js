const request = require("supertest");
const Task = require("../src/models/task");
const app = require('../src/app')
const { userOne, userOneId, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Create task ",async () => {
    const res = await request(app)
    .post('/tasks')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        description : 'Testing',
    }).expect(201)

    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
});

test('GET user tasks', async ()=> {
    const res = await request(app)
    .get('/tasks')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(res.body.le)
})