var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var usuariosRouter = require('./routes/usuariosRouter');
var authRouter = require('./routes/auth');
var estudiantesRoutes = require('./routes/estudiantesRouter');
var insignias_estudianteRoutes = require('./routes/insignias_estudianteRouter');
var notificaciones_estudianteRoutes = require('./routes/notificaciones_estudianteRouter');
var insigniasRoutes = require('./routes/insigniasRouter');
var progresoActividadesRoutes = require('./routes/progreso_actividadesRouter');
var progresoLecturasRoutes = require('./routes/progreso_lecturasRouter');
var actividadesRoutes = require('./routes/actividadesRouter');
var reportesRoutes = require('./routes/reportesRouter');
var evaluacionesInicialesRoutes = require('./routes/evaluaciones_inicialesRouter');
var institucionesAdminRoutes = require('./routes/institucionesAdminRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Rutas de autenticación
app.use('/auth', authRouter);

// Rutas de usuarios/docentes (CRUD)
app.use('/usuarios', usuariosRouter);

//Rutas varias
app.use('/estudiantes', estudiantesRoutes);
app.use('/insignias-estudiante', insignias_estudianteRoutes);
app.use('/notificaciones-estudiante', notificaciones_estudianteRoutes);
app.use('/insignias', insigniasRoutes);
app.use('/progreso-actividades', progresoActividadesRoutes);
app.use('/progreso-lecturas', progresoLecturasRoutes);
app.use('/actividades', actividadesRoutes);
app.use('/reportes', reportesRoutes);
app.use('/evaluacion-inicial', evaluacionesInicialesRoutes);
app.use('/instituciones-admin', institucionesAdminRoutes);

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

module.exports = app; 
