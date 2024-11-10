"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Job = require("../models/job");

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

/************************************** POST /jobs */
// ONLY WORKS FOR ADMINS
describe("POST /jobs", function(){
    test("works for admins", async function(){
        const resp = await request(app)
                .post("/jobs")
                .send({
                    title : "title",
                    salary : 100,
                    equity : 0.1,
                    company_handle : "c1"
                })
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body.job).toEqual({
            id : expect.any(Number),
            title : "title",
            salary : 100,
            equity : "0.1",
            company_handle : "c1"
        });
    })
      
    test("unauth for non-admins", async function(){
        const resp = await request(app)
                .post("/jobs")
                .send({
                    title : "title",
                    salary : 100,
                    equity : 0.1,
                    company_handle : "c1"
                })
                .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function(){
        const resp = await request(app)
                .post("/jobs")
                .send({
                    title : "title",
                    salary : 100,
                    equity : 0.1,
                    company_handle : "c1"
                });
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /jobs */
// UPDATED TO ACCEPT FILTERS
describe("GET /jobs", function() {
    beforeEach(async function() {
        // Remove all jobs before running tests
        await Job.removeAll();
        
        // Create sample jobs
        await Job.create({
            title: "software engineer",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        });
        await Job.create({
            title: "software developer",
            salary: 300,
            equity: 0.2,
            company_handle: "c1"
        });
        await Job.create({
            title: "mailman",
            salary: 300,
            equity: 0.3,
            company_handle: "c1"
        });
    });

    afterEach(async function() {
        // Optionally remove all jobs after each test (if needed)
        await Job.removeAll();
    });

    test("works for anon", async function() {
        const resp = await request(app)
            .get("/jobs");
        expect(resp.body).toEqual({
            jobs: expect.any(Array)
        });
    });

    test("filters by title", async function() {
        const resp = await request(app)
            .get("/jobs?title=software");
        expect(resp.body).toEqual({
            jobs: expect.arrayContaining([
                expect.objectContaining({
                    title: "software engineer",
                    salary: 100,
                    equity: "0.1",
                    company_handle: "c1"
                }),
                expect.objectContaining({
                    title: "software developer",
                    salary: 300,
                    equity: "0.2",
                    company_handle: "c1"
                })
            ])
        });
    });
});

/************************************** GET /jobs/:id */
describe("GET /jobs/:id", function(){
    test("works for anon", async function(){
        let newJob = await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        const resp = await request(app)
                .get(`/jobs/${newJob.id}`);
        expect(resp.body).toEqual({
            job : {
                id : newJob.id,
                title : "title",
                salary : 100,
                equity : "0.1",
                company_handle : "c1"
            }
        });
    });
});


/************************************** PATCH /jobs/:id */
describe("PATCH /jobs/:id", function(){
    test("works for admins", async function(){
        let newJob = await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        const resp = await request(app)
                .patch(`/jobs/${newJob.id}`)
                .send({
                    title : "title2",
                    salary : 200,
                    equity : 0.2
                })
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
            job : {
                id : newJob.id,
                title : "title2",
                salary : 200,
                equity : "0.2",
                company_handle : "c1"
            }
        });
    });

    test("unauth for non-admins", async function(){
        let newJob = await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        const resp = await request(app)
                .patch(`/jobs/${newJob.id}`)
                .send({
                    title : "title2",
                    salary : 200,
                    equity : 0.2
                })
                .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function(){
        let newJob = await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        const resp = await request(app)
                .patch(`/jobs/${newJob.id}`)
                .send({
                    title : "title2",
                    salary : 200,
                    equity : 0.2
                });
        expect(resp.statusCode).toEqual(401);
    });
});

describe("DELETE /jobs/:id", function(){
    test("works for admins", async function(){
        let newJob = await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        const resp = await request(app)
                .delete(`/jobs/${newJob.id}`)
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({ deleted: String(newJob.id) });
    });

    test("unauth for non-admins", async function(){
        let newJob = await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        const resp = await request(app)
                .delete(`/jobs/${newJob.id}`)
                .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function(){
        let newJob = await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        const resp = await request(app)
                .delete(`/jobs/${newJob.id}`);
        expect(resp.statusCode).toEqual(401);
    });
});

