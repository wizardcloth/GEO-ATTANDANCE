const express = require("express");
const app = express();
// const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");
// const { METHODS } = require("http");
require("dotenv").config();
// const corsconfig = {
//     origin: "*",
//     Credential: true,
//     methods: ["GET", "POST", "PUT", "DELETE"]
// }

// app.use(cors());
// app.options("", cors(corsconfig));
let port = 8080;
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.use(express.static(path.join(__dirname, "/public/images")));



// const connection = mysql.createConnection({
//     host: process.env.HOST,
//     user: process.env.USER,
//     database: process.env.DATABASE,
//     password: process.env.PASSWORD
// });

// let q = "insert into users (id,firstname,lastname,email,password,conformpassword) values ? ";

app.listen(port, () => {
    console.log("app is listening");
})

app.get("/", (req, res) => {
    res.render("home.ejs");
})


app.get("/login", (req, res) => {
    res.render("login.ejs");
})


app.get("/register", (req, res) => {
    res.render("register.ejs");
})


const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection process.env.uri
const client = new MongoClient(process.env.uri);

app.post('/register', async (req, res) => {
    let { firstname, sirname, email, password, conformpassword } = req.body;

    if (firstname && sirname && email && password && conformpassword) {
        if (password !== conformpassword) {
            return res.render('error.ejs', { message: 'Passwords do not match' });
        }

        let id = uuidv4();
        let newUser = {
            id: id,
            firstname: firstname,
            sirname: sirname,
            email: email,
            password: password, 
        };

        try {
            // Connect to the MongoDB client
            await client.connect();
            console.log("connected");
            // Access the database and collection
            const database = client.db('your_database_name');
            const collection = database.collection('users');

            // Insert the new user
            const result = await collection.insertOne(newUser);
            console.log(result);

            res.redirect('/');
        } catch (err) {
            console.error("Some error occurred!!!", err);
            res.render('error.ejs');
        } finally {
            // Close the connection to the MongoDB client
            await client.close();
        }
    } else {
        console.log("Some error occurred!!!");
        res.render('error.ejs');
    }
});


// Replace with your MongoDB connection process.env.uri

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
        try {
            // Connect to the MongoDB client
            await client.connect();

            // Access the database and collection
            const database = client.db('your_database_name');
            const collection = database.collection('users');

            // Query for user credentials
            const user = await collection.findOne({ email: email, password: password });

            if (user) {
                res.render('user.ejs');
            } else {
                res.redirect('/register');
                // Or use res.send("<script> alert('wrong credentials') </script>"); if you prefer
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } finally {
            // Close the connection to the MongoDB client
            await client.close();
        }
    } else {
        res.send('<h1>No tricks!!!</h1>');
    }
});




app.get("/forget", (req, res) => {
    res.render("forget.ejs");
})

app.get("/login/admin", (req, res) => {
    res.render("login_admin.ejs");

})

// const bcrypt = require('bcrypt');


app.post('/login/admin', async (req, res) => {
    const { adminemail, adminpassword } = req.body;

    if (adminemail && adminpassword) {
        try {
            // Connect to the MongoDB client
            await client.connect();

            // Access the database and collection
            const database = client.db('your_database_name');
            const collection = database.collection('admin');

            // Find the admin user
            const admin = await collection.findOne({ adminemail: adminemail },{adminpassword:adminpassword});
            // console.log(admin);

            if (admin) {
                // Compare the provided password with the hashed password in the database
                // const match = await bcrypt.compare(adminpassword, admin.password);

                if (adminemail == admin.adminemail && adminpassword == admin.adminpassword) {
                    res.render('admin.ejs');
                } else {
                    res.render('error.ejs', { message: 'Wrong credentials' });
                }
            } else {
                res.render('error.ejs', { message: 'Wrong credentials' });
            }
        } catch (err) {
            console.error('Some error occurred!!!', err);
            res.render('error.ejs');
        } finally {
            // Close the connection to the MongoDB client
            await client.close();
        }
    } else {
        res.send('<h1>No tricks!!!</h1>');
    }
});


// app.get("/login/user", (req, res) => {
//     res.render("user.ejs");
// })