const db = require("../db");
const Job = require("./job.js"); 
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

// Global beforeEach and afterEach hooks for common setup/teardown
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function(){
    test("works", async function(){
        const job = await Job.create({
            title: "title",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        });
        expect(job).toEqual({
            id: expect.any(Number),
            title: "title",
            salary: 100,
            equity: "0.1",
            company_handle: "c1"
        });
    });
});

describe("getAll", function(){
    beforeAll(async () => {
        // Any setup specific to getAll tests (e.g., inserting more jobs)
        await Job.create({
            title: "Job 1",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        });
        await Job.create({
            title: "Job 2",
            salary: 150,
            equity: 0.2,
            company_handle: "c2"
        });
    });

    test("works", async function(){
        const jobs = await Job.getAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "Job 1",
                salary: 100,
                equity: "0.1",
                company_handle: "c1"
            },
            {
                id: expect.any(Number),
                title: "Job 2",
                salary: 150,
                equity: "0.2",
                company_handle: "c2"
            }
        ]);
    });
});

describe("get", function(){
    let jobId;

    beforeAll(async () => {
        // Create a job to ensure it exists before the test runs
        const job = await Job.create({
            title: "Job 1",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        });
        jobId = job.id;  // Store the created job's ID for later use
    });

    test("works", async function(){
        const job = await Job.get(jobId);  // Use the created job's ID
        expect(job).toEqual({
            id: jobId,  // Ensure that the correct job ID is used
            title: "Job 1",
            salary: 100,
            equity: "0.1",
            company_handle: "c1"
        });
    });

    test("not found if no such job", async function(){
        await expect(Job.get(999)).rejects.toThrow("No job: 999");
    });
});

describe("getFiltered", function () {
    beforeAll(async () => {
        // add jobs to ensure they exist before the test runs
        await Job.removeAll(); // Clear existing jobs so they don't affect the test
        await Job.create({
            title: "Job 1",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        });
        await Job.create({
            title: "Job 2",
            salary: 150,
            equity: 0.2,
            company_handle: "c2"
        });
    })
    test("works", async function () {
        const jobs = await Job.getFiltered("Job", 100, true);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "Job 1",
                salary: 100,
                equity: "0.1",
                company_handle: "c1"
            },
            {
                id: expect.any(Number),
                title: "Job 2",
                salary: 150,
                equity: "0.2",
                company_handle: "c2"
            }
        ]);
    });

    test("no jobs found", async function () {
        const jobs = await Job.getFiltered("Job", 200, true);
        expect(jobs).toEqual([]);
    });
});

describe("update", function(){
    let jobId;

    beforeAll(async () => {
        // Create a job to ensure it exists before the test runs
        const job = await Job.create({
            title: "Job 1",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        });
        jobId = job.id;  // Store the created job's ID for later use
    });

    test("works", async function(){
        // Provide the necessary fields (title, salary, and equity)
        const updatedJob = await Job.update(jobId, {
            title: "Updated Job Title",
            salary: 120,
            equity: 0.2
        });

        expect(updatedJob).toEqual({
            id: jobId,  // Ensure that the correct job ID is used
            title: "Updated Job Title",
            salary: 120,
            equity: "0.2",  // Note that equity might be stored as a string in your DB
            company_handle: "c1"
        });
    });

    test("not found if no such job", async function() {
        await expect(Job.update(999, {
            title: "Updated Job",
            salary: 150,
            equity: 0.2
        })).rejects.toThrow("No job: 999");
    });    
});


describe("remove", function(){
    let jobId;

    beforeAll(async () => {
        // Create a job to ensure it exists before the test runs
        const job = await Job.create({
            title: "Job 1",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        });
        jobId = job.id;  // Store the created job's ID for later use
    });

    test("works", async function(){
        const job = await Job.remove(jobId);
        expect(job).toEqual({
            id: jobId,  // only expect the ID to be returned
        });
    });

    test("not found if no such job", async function(){
        await expect(Job.remove(999)).rejects.toThrow("No job: 999");
    });
});
