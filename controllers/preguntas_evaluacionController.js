const preguntas_evaluacion = require('../models').preguntas_evaluacion_model;
module.exports = {
    list(req, res) {
        return preguntas_evaluacion
            .findAll({})
            .then((preguntas_evaluacion) => res.status(200).send(preguntas_evaluacion))
            .catch((error) => { res.status(400).send(error); });
    },
};