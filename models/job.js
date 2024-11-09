"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class Job {
    // Create a job in the database by sending data and return the created job
    static async create({ title, salary, equity, company_handle }) {
        const equityAsFloat = parseFloat(equity); // Convert equity to a float, not a string
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [
                title,
                salary,
                equityAsFloat,
                company_handle,
            ]
        );
        const job = result.rows[0];
        console.log("Created job:", job);
        return job;
    }    

    // Get all jobs
    static async getAll(){
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
             FROM jobs
             ORDER BY title`
        );
        return result.rows;
    }

    // Get job by id
    static async get(id){
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = $1`,
            [id]
        );
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    // Get jobs with optional filters (title, minSalary, hasEquity)
    static async getFiltered(title = "", minSalary = 0, hasEquity = false) {
        console.log("Received query parameters:", { title, minSalary, hasEquity });
    
        // Ensure minSalary is a number
        minSalary = parseInt(minSalary, 10);  // Convert to an integer
    
        // Log the parsed value to check
        console.log("Parsed minSalary:", minSalary);
    
        let query = `SELECT id, title, salary, equity, company_handle
                     FROM jobs
                     WHERE 1=1`;
    
        const values = [];
        let idx = 1;
    
        if (title) {
            query += ` AND title ILIKE $${idx}`;
            values.push(`%${title}%`);
            idx++;
        }
    
        // Check if minSalary is a valid number before using it
        if (minSalary !== undefined && !isNaN(minSalary) && minSalary > 0) {
            query += ` AND salary >= $${idx}`;
            values.push(minSalary);
            idx++;
        }
    
        if (hasEquity) {
            query += ` AND equity > 0`;
        }
    
        query += ` ORDER BY title`;
    
        // Execute the query
        try {
            const result = await db.query(query, values);
            console.log("Query result:", result.rows);
            return result.rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw new Error("Error executing query.");
        }
    }
     

    // Update job (never change id or companyHandle)
    static async update(id, { title, salary, equity }) {
        // Construct the SET clause for SQL dynamically based on provided fields
        const setFields = [];
        const values = [];
        let index = 1;
      
        if (title) {
          setFields.push(`title = $${index}`);
          values.push(title);
          index++;
        }
      
        if (salary !== undefined) { // Include salary even if it's 0 or negative (based on your model rules)
          setFields.push(`salary = $${index}`);
          values.push(salary);
          index++;
        }
      
        if (equity !== undefined) { // Include equity even if it's 0 or 1 (based on your model rules)
          setFields.push(`equity = $${index}`);
          values.push(equity);
          index++;
        }
      
        // If no valid fields were provided for update, throw an error
        if (setFields.length === 0) {
          throw new Error("No valid fields to update.");
        }
      
        // Build the SQL query dynamically
        const query = `
          UPDATE jobs
          SET ${setFields.join(", ")}
          WHERE id = $${index}
          RETURNING id, title, salary, equity, company_handle
        `;
      
        values.push(id); // Add the job ID as the last parameter
      
        const result = await db.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error(`No job: ${id}`);
        }
      
        return result.rows[0]; // Return the updated job
      }
       
    
    // Delete job by id
    static async remove(id){
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]
        );
        const job = result.rows[0];
        if(!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    // remove all (added for testing)
    static async removeAll(){
        await db.query(`DELETE FROM jobs`);
    }

}

module.exports = Job;