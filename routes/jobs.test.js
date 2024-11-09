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
describe("GET /jobs", function(){
    test("works for anon", async function(){
        const resp = await request(app)
                .get("/jobs");
        expect(resp.body).toEqual({
            jobs : []
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

/************************************** GET /jobs/filtered */
describe("GET /jobs/filtered", function(){
    beforeEach(async function(){
        await Job.removeAll();
        await Job.create({
            title : "title",
            salary : 100,
            equity : 0.1,
            company_handle : "c1"
        });
        await Job.create({
            title : "title2",
            salary : 200,
            equity : 0.2,
            company_handle : "c1"
        });
        await Job.create({
            title : "title3",
            salary : 300,
            equity : 0.3,
            company_handle : "c1"
        });
    });

    test("works", async function(){
        const minSalary = 200;
        const resp = await request(app)
                .get(`/jobs/filtered?title=title&minSalary=${minSalary}&hasEquity=true`);
                console.log("RESP BODYYYYY",resp.body);
        expect(resp.body).toEqual({
            jobs : [
                {
                    id : expect.any(Number),
                    title : "title2",
                    salary : 200,
                    equity : "0.2",
                    company_handle : "c1"
                },
                {
                    id : expect.any(Number),
                    title : "title3",
                    salary : 300,
                    equity : "0.3",
                    company_handle : "c1"
                }
            ]
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

