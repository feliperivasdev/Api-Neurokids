const respuestas_evaluacion = require('../models').respuestas_evaluacion_model;
module.exports = {
    list(req, res) {
        return respuestas_evaluacion
            .findAll({})
            .then((respuestas_evaluacion) => res.status(200).send(respuestas_evaluacion))
            .catch((error) => { res.status(400).send(error); });
    },
};