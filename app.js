require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

//swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDoc = YAML.load('./swagger.yaml')

//connect db
const connectDB = require('./db/connect');
const authUser = require('./middleware/authentication');

//router
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const { request } = require('express');

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

app.get('/',(req,res) =>{
  res.send('<h1>Job API</h1><a href="/api-docs">Doc</a>')
})

app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDoc));
//routes
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/jobs',authUser,jobsRouter);



app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
