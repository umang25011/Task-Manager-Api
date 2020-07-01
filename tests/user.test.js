const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {userOne, userOneId, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase);
afterEach(() => {
    // console.log("afterEach");
});

test("Should signup a new user", async () => {
    const response = await request(app)
        .post("/users")
        .send({
            name: "Umang",
            email: "abc1234@gmail.com",
            password: "1234567",
            age: 20,
        })
        .expect(201);

        //Assert that the database was changed
        const user = await User.findById(response.body.user._id)
        expect(user).not.toBeNull()

        //Assertion about user body
        expect(response.body).toMatchObject({
            user : {
                name : "Umang",
                email : 'abc1234@gmail.com',
            },
            token : user.tokens[0].token
        })
        expect(user.password).not.toBe('1234567')

});

test("Should log in existing user", async () => {
    const res = await request(app)
        .post("/users/login")
        .send({
            email: userOne.email,
            password: userOne.password,
        })
        .expect(200);
    const user = await User.findById(userOneId)

    expect(res.body.token).toBe(user.tokens[1].token)
});

test("Should not login nonexistant user", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: userOne.email,
            password: "fakepassword",
        })
        .expect(400);
});

test("Should fetch user profile", async () => {
    await request(app)
    .get("/users/me")
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async ()=> {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async ()=>{
    const res = await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
} )

test('Should not delete account for unauthorised user', async ()=>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
} )

test('Upload Avatar',async ()=> {
        await request(app)
        .post('/users/me/avatar')
        .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update User', async ()=> {
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        name : 'Umang'
    }).expect(200)

    const user =await User.findById(userOneId)
    expect(user.name).toEqual('Umang')
})

test('Invalid fields should not update', async ()=> {
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        location : 'Umang Patel'
    }).expect(400)
})