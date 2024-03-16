const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors=require("cors");
const errorHandler= require("./middleware/error-handler.js");

//routes imports
const productRouter= require('./routers/products.js');
const categoryRouter= require('./routers/categories.js');
const orderRouter= require('./routers/orders.js');
const userRouter= require('./routers/users.js');
const authJWT = require('./middleware/jwt.js');
require("dotenv/config");


const api=process.env.API_URL;
const app = express();
const port = 3000;



app.use(cors());
app.options('*',cors());
//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJWT());
app.use('/images/upload', express.static(__dirname + '/images/upload'));
app.use(errorHandler);

//routes
app.use(`${api}/product`, productRouter);
app.use(`${api}/category`, categoryRouter);
app.use(`${api}/order`, orderRouter);
app.use(`${api}/user`, userRouter);


mongoose
  .connect(process.env.DBURL,{dbName:"not-so-mini-database"})
  .then(() => {
    console.log("database connected successful");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(port, () => {
  console.log("not so mini server is running on " + port);
});
