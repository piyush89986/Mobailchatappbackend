import dotenv from 'dotenv';
dotenv.config();
import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from "cors"


import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.route.js';
import chatRouter from './routes/chat.js'

const app = express();
const normalizeOrigin = (value = '') => value.trim().replace(/\/$/, '');
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => normalizeOrigin(origin)).filter(Boolean)
  : [];
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const requestOrigin = normalizeOrigin(origin);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin);
    const isVercelOrRender = requestOrigin.includes('vercel.app') || requestOrigin.includes('onrender.com');

    if (
      process.env.NODE_ENV !== 'production' ||
      isLocalhost ||
      isVercelOrRender ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(requestOrigin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// view engine setup
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions));
app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);
app.use("/uploads", express.static('uploads'));




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
