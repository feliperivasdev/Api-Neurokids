var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var evaluaciones_usuariosRouter = require('./routes/evaluaciones_usuarios');
var evaluacionesRouter = require('./routes/evaluaciones');
var insigniasRouter = require('./routes/insignias');
var institucionesRouter = require('./routes/instituciones');
var juegosRouter = require('./routes/juegos');
var lecturasRouter = require('./routes/lecturas');
var niveles_dificultadRouter = require('./routes/niveles_dificultad');
var preguntas_evaluacionRouter = require('./routes/preguntas_evaluacion');
var preguntas_lecturaRouter = require('./routes/preguntas_lectura');
var rangos_edadRouter = require('./routes/rangos_edad');
var respuestas_evaluacionRouter = require('./routes/respuestas_evaluacion');
var respuestas_lecturaRouter = require('./routes/respuestas_lectura');
var resultados_preguntasRouter = require('./routes/resultados_preguntas');
var rolesRouter = require('./routes/roles');
var usuarios_insigniasRouter = require('./routes/usuarios_insignias');
var usuarios_juegosRouter = require('./routes/usuarios_juegos');
var usuarios_lecturasRouter = require('./routes/usuarios_lecturas');
var usuariosRouter = require('./routes/usuarios');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/evaluaciones_usuarios', evaluaciones_usuariosRouter);
app.use('/evaluaciones', evaluacionesRouter);
app.use('/insignias', insigniasRouter);
app.use('/instituciones', institucionesRouter);
app.use('/juegos', juegosRouter);
app.use('/lecturas', lecturasRouter);
app.use('/niveles_dificultad', niveles_dificultadRouter);
app.use('/preguntas_evaluacion', preguntas_evaluacionRouter);
app.use('/preguntas_lectura', preguntas_lecturaRouter);
app.use('/rangos_edad', rangos_edadRouter);
app.use('/respuestas_evaluacion', respuestas_evaluacionRouter);
app.use('/respuestas_lectura', respuestas_lecturaRouter);
app.use('/resultados_preguntas', resultados_preguntasRouter);
app.use('/roles', rolesRouter);
app.use('/usuarios_insignias',usuarios_insigniasRouter);
app.use('/usuarios_juegos',usuarios_juegosRouter);
app.use('/usuarios_lecturas',usuarios_lecturasRouter);
app.use('/usuarios',usuariosRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
