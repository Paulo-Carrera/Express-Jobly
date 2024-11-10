"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 * 
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */
router.post("/", ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity (will find only jobs that provide equity)
 * - companyHandle (will find only jobs for the specified company)
 *
 * Authorization required: none
 */
router.get("/", async function(req, res, next) {
    const { title, minSalary, hasEquity, companyHandle } = req.query;

    console.log("Received query parameters:", { title, minSalary, hasEquity, companyHandle });

    try {
        const jobs = await Job.getFiltered(
            title,
            minSalary ? parseInt(minSalary, 10) : undefined,
            hasEquity === 'true',
            companyHandle
        );
        console.log("Jobs returned:", jobs); // Log filtered jobs for debugging
        return res.json({ jobs });
    } catch (err) {
        console.error("Error in GET /jobs route:", err.message);
        return next(err);
    }
});

/** GET /[id] => { job }
 *
 * Job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */
router.get("/:id", async function(req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] { fields } => { job }
 *
 * Patches job data.
 *
 * Fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[id] => { deleted: id }
 *
 * Authorization required: admin
 */
router.delete("/:id", ensureAdmin, async function(req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.status(200).json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
