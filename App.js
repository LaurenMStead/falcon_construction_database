// ---------- SETUP ----------
// Express
var express = require('express');
var app = express();
PORT = 5975;

// Database
var db = require('./database/db-connector')

// Handlebars
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({ extname: ".hbs" }));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                  // Tell express to use the handlebars engine whenever it encounters a *.hbs file.
const hbs = require('hbs');
hbs.registerPartials(__dirname + '/partials');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// ---------- END SETUP ----------

// ---------- ROUTES ----------
// WORKS - Home Page
app.get('/', function (req, res) {
    res.render('index', { title: "Home Page", active: { Register: true } });
});

// WORKS - READ Jobs
app.get('/jobs', function (req, res) {
    // dropdown populating list
    let jobStatus = ['New', 'In Progress', 'Complete', 'Abandoned'];

    // queries
    let queryAllJobs = `SELECT * FROM Jobs ORDER BY job_id;`;
    let queryCustomerID = `SELECT customer_id, CONCAT(customer_first_name, ' ', customer_last_name) AS name FROM Customers ORDER BY customer_id`;
    let queryCategoryID = `SELECT category_id, category_name FROM Categories ORDER BY category_id`;

    db.pool.query(queryAllJobs, function (err, rows, fields) {
        let all_job_data = rows;
        db.pool.query(queryCustomerID, function (err, rows, fields) {
            let customer_data = rows;
            db.pool.query(queryCategoryID, function (err, rows, fields) {
                return res.render('jobs', {
                    title: "Jobs Page", active: { Register: true }, all_job_data: all_job_data,
                    customer_data: customer_data, category_data: rows, jobStatus: jobStatus});
            })
        })
    })
});

// WORKS - CREATE/INSERT Jobs
app.post('/add-job', function (req, res) {
    let data = req.body;

    let end_date = data.job_end_date;
    if (isNaN(end_date) || typeof (end_date) == "undefined") {
        end_date = 'NULL';
    }

    let queryAddJob =
        `INSERT INTO Jobs (
        fk_customer_id,
        fk_category_id,
        job_code,
        job_start_date,
        job_end_date,
        job_description,
        job_status)

    VALUES (
        '${data['customer_ID_Select']}',
        '${data['category_ID_Select']}',
        '${data['job_code']}',
        '${data['job_start_date']}',
        '${end_date}',
        '${data['job_description']}',
        '${data['job_status']}')`;

    db.pool.query(queryAddJob, function (error, rows, fields) {

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal, so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else {
            res.redirect('/jobs');
        }
    })
});

// WORKS - READ Customers
app.get('/customers', function (req, res) {
    // dropdown populating lists

    let cusStates = 
    ['AL','AK','AL','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','ME',
    'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','PR',
    'RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

    let queryAllCustomers = `SELECT * FROM Customers ORDER BY customer_id;`;


    db.pool.query(queryAllCustomers, function (err, rows, fields) {
        res.render('customers', {
            title: "Customers Page", active: { Register: true }, data: rows,
            cusStates: cusStates});
    })
});

// WORKS - CREATE/INSERT Customers
app.post('/add-customer', function (req, res) {
    let data = req.body;

    let customer_company = data.customer_company;
    if(isNaN(customer_company) || customer_company === 'undefined')
    {
        customer_company = null;
    }

    let queryAddCustomer =
    `INSERT INTO Customers (
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        customer_company,
        customer_address,
        customer_city,
        customer_state,
        customer_zip_code)

    VALUES (
    '${data['customer_first_name']}',
    '${data['customer_last_name']}',
    '${data['customer_email']}',
    '${data['customer_phone']}',
    '${customer_company}',
    '${data['customer_address']}',
    '${data['customer_city']}',
    '${data['customer_state_Select']}',
    '${data['customer_zip_code']}')`;

    db.pool.query(queryAddCustomer, function (error, rows, fields) {

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal, so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else {
            res.redirect('/customers');
        }
    })
});

// WORKS - READ Categories
app.get('/categories', function (req, res) {
    //NEED TO ADD DROPDOWN FORM INFO

    let queryAllCategories = "SELECT * FROM Categories ORDER BY category_id;";

    db.pool.query(queryAllCategories, function (err, rows, fields) {
        res.render('categories', { title: "Categories Page", active: { Register: true }, data: rows });
    })
});

// WORKS - CREATE/INSERT Categories
app.post('/add-category', function (req, res) {
    let data = req.body;

    let queryAddCategory =
    `INSERT INTO Categories (category_name) 
    VALUES('${data['category_name']}')`;


    db.pool.query(queryAddCategory, function (error, rows, fields) {

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal, so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else {
            res.redirect('/categories');
        }
    })
});

// WORKS - READ Employees
app.get('/employees', function (req, res) {
    // dropdown populating lists

    let employeeTitles = ['Foreman', 'Lead Foreman', 'Supervisor', 'Manager'];
    let queryAllEmployees = "SELECT * FROM Employees ORDER BY employee_id;";


    db.pool.query(queryAllEmployees, function (err, rows, fields) {
        res.render('employees', {
            title: "Employees Page", active: { Register: true }, data: rows,
            employeeTitles: employeeTitles
        });
    })

});

//  WORKS - CREATE/INSERT Employee
app.post('/add-employee', function (req, res) {
    let data = req.body;

    let queryAddEmployee =
        `INSERT INTO Employees (
        employee_code,
        employee_first_name,
        employee_last_name,
        employee_email,
        employee_job_title
        )
        
    VALUES(
        '${data['employee_code']}',
        '${data['employee_first_name']}',
        '${data['employee_last_name']}',
        '${data['employee_email']}',
        '${data['employee_title']}')`;


    db.pool.query(queryAddEmployee, function (error, rows, fields) {

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal, so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else {
            res.redirect('/employees');
        }
    })
});

// WORKS - READ Job_Employees
app.get('/job_employees', function (req, res) {

    // queries
    let queryEmployeeID = `SELECT employee_id, CONCAT(employee_first_name, ' ', employee_last_name) AS employee_name FROM Employees ORDER BY employee_id`;
    let queryJobID = `SELECT job_id, CONCAT(job_code, ' - ', job_description) AS job_info FROM Jobs ORDER BY job_id`;
    let queryJobEmployees = `SELECT * FROM Job_Employees ORDER BY job_employee_id;`;

    db.pool.query(queryJobEmployees, function (err, rows, fields) {
        let job_employee_data = rows;
        db.pool.query(queryEmployeeID, function (err, rows, fields) {
            let employee_data = rows;
            db.pool.query(queryJobID, function (err, rows, fields) {
                res.render('job_employees', { title: "Job_Employees Page", active: { Register: true },
                    job_employee_data: job_employee_data, employee_data : employee_data, job_data : rows}
                );
            })
        })
    })
});

//  WORKS - CREATE/INSERT Job_Employee
app.post('/add-job-employee', function (req, res) {
    let data = req.body;

    let queryAddJobEmployee =
        `INSERT INTO Job_Employees (
        fk_employee_id,
        fk_job_id)
    VALUES(
        ${data['employee_id']},
        ${data['job_id']})`;


    db.pool.query(queryAddJobEmployee, function (error, rows, fields) {

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal, so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

            // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else {
            res.redirect('/job_employees');
        }
    })
});

// NOT TESTED - DELETE Job_Employee
app.delete('/delete-job-employee', function(req, res, next){
    let data = req.body;
    let id_to_delete = parseInt(data.id);
    let delete_Job_Employee = `DELETE FROM Job_Employees WHERE job_employee_id = ?`;

    console.log(delete_Job_Employee);

    db.pool.query(delete_Job_Employee, [id_to_delete], function(err, rows, fields){
        if(err){
            // Log the error to the terminal, so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(err);
            res.sendStatus(400);
        }
        else{
            res.sendStatus(204);
        }
        res.redirect('/job_employees');
    })
});

// WORKS - READ and search for relationships
app.get('/job_employees_search', function (req, res) {

    let queryJobEmployeesSearch;

    if(req.query.job_id === undefined || req.query.job_id === "ALL"){
        queryJobEmployeesSearch = `SELECT Job_Employees.job_employee_id AS job_employee_id, 
            Jobs.job_id AS job_id, 
            Jobs.job_description AS job_description, 
            Employees.employee_id AS employee_id, 
            CONCAT(Employees.employee_first_name, ' ', Employees.employee_last_name) AS name, 
            Employees.employee_job_title AS title, 
            Categories.category_id AS category_id, 
            Categories.category_name AS category_name 
        FROM Employees 
            INNER JOIN Job_Employees ON Employees.employee_id = Job_Employees.fk_employee_id 
            INNER JOIN Jobs ON Jobs.job_id = Job_Employees.fk_job_id 
            INNER JOIN Categories ON Categories.category_id = Jobs.fk_category_id 
        ORDER BY Job_Employees.job_employee_id;`;
    }
    else{
        queryJobEmployeesSearch = `SELECT Job_Employees.job_employee_id AS job_employee_id, 
            Jobs.job_id AS job_id, 
            Jobs.job_description AS job_description, 
            Employees.employee_id AS employee_id, 
            CONCAT(Employees.employee_first_name, ' ', Employees.employee_last_name) AS name, 
            Employees.employee_job_title AS title, 
            Categories.category_id AS category_id, 
            Categories.category_name AS category_name 
        FROM Employees 
            INNER JOIN Job_Employees ON Employees.employee_id = Job_Employees.fk_employee_id 
            INNER JOIN Jobs ON Jobs.job_id = Job_Employees.fk_job_id 
            INNER JOIN Categories ON Categories.category_id = Jobs.fk_category_id
        WHERE Jobs.job_id = "${req.query.job_id}%"
        ORDER BY Job_Employees.job_employee_id;`;
    }

    db.pool.query(queryJobEmployeesSearch, function (err, rows, fields) {

        let searchResults = rows;

        let queryJobID = `SELECT job_id, CONCAT(job_code, ' - ', job_description) AS job_info FROM Jobs ORDER BY job_id`;

        db.pool.query(queryJobID, function (err, rows, fields) {
            // for (let i = 0; i < rows.length; i++) {
            //     job_data.push([rows[i]["job_id"], rows[i]["job_info"]]);
            // }
            return res.render('job_employees_search', { title: "Job_Employees Search Page", active: { Register: true },
                data: searchResults, job_data: rows });
        })


    })
});
// ---------- END ROUTES ----------

// ---------- LISTENER ----------
app.listen(PORT, function () {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
// ---------- END LISTENER ----------