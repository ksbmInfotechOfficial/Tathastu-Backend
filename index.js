require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 5000;
const cors = require('cors');
const db = require('./config/dbConnection');
const morgan = require('morgan');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerJsDocs = YAML.load('./api.yaml');
const cron = require('./cron/bookingReminder');



// connect to database
db()

// express app
const app = express();


// swagger setup
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJsDocs))

//setup view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());
app.use(express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(morgan('dev'));




// route
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const customerRoute = require('./routes/customerRoute');
app.use('/api/users', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/customer', customerRoute);


//auth route
const authRoute = require('./routes/authRoute');
app.use('/', authRoute);





app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})