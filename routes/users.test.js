"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */
// UPDATED TO WORK ONLY FOR ADMINS
describe("POST /users", function () {
  test("works for admins", async function(){
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u4",
          firstName: "U4F",
          lastName: "U4L",
          email: "u4@u4.com",
          isAdmin: true,
          password: "password",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body.user).toEqual({
      username: "u4",
      firstName: "U4F",
      lastName: "U4L",
      email: "u4@u4.com",
      isAdmin: true,
    });
  });

  test("unauth for non-admins", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u4",
          firstName: "U4F",
          lastName: "U4L",
          email: "u4@u4.com",
          isAdmin: false,
          password: "password",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u4",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** POST /users/:username/jobs/:id */
// WORKS FOR ADMIN OR CORRECT USER
describe("POST /users/:username/jobs/:id", () => {
  beforeEach(async () => {
    await db.query(`DELETE FROM applications`);
    await db.query(`DELETE FROM jobs`);
    await db.query(`DELETE FROM users`);

    await db.query(`
      INSERT INTO users(username, password, first_name, last_name, email, is_admin)
      VALUES ('u1', 'password1', 'U1F', 'U1L', 'user1@user.com', true),
             ('u2', 'password2', 'U2F', 'U2L', 'user2@user.com', false)`);
    await db.query(`
      INSERT INTO jobs(id, title, salary, equity, company_handle)
      VALUES (1, 'Job1', 100, 0.1, 'c1')`);
  })
  test("works for correct user", async () => {
    const resp = await request(app)
        .post(`/users/u1/jobs/1`)
        .send()
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
        .post(`/users/u1/jobs/1`)
        .send()
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app)
        .post(`/users/u1/jobs/1`)
        .send();
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admins", async () => {
    const resp = await request(app)
        .post(`/users/u2/jobs/1`)
        .send()
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
  })
})

/************************************** GET /users */
// UPDATED TO WORK ONLY FOR ADMINS
describe("GET /users", function () {
  test("works for admins", async function(){
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          isAdmin: true,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          isAdmin: false,
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          isAdmin: false,
        }],
    });
  });

  test("unauth for non-admins", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /users/:username */
// UPDATED TO WORK ONLY FOR ADMINS AND CORRECT USER
describe("GET /users/:username", function () {
  test("works for correct user", async function(){
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: true,
      },
    });
  });

  test("unauth for wrong user", async function(){
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });
});


/************************************** PATCH /users/:username */
// UPDATED TO WORK ONLY FOR ADMINS AND CORRECT USER
describe("PATCH /users/:username", () => {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: true,
      },
    });
  });

  test("works for correct user", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: true,
      },
    });
  });

  test("unauth for non-admins", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for wrong user", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for admins", async function(){
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("works for correct user", async function(){
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth for non-admins", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });
});
