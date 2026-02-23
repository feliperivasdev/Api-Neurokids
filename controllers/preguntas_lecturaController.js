const preguntas_lectura = require('../models').preguntas_lectura_model;
module.exports = {
    list(req, res) {
        return preguntas_lectura
            .findAll({})
            .then((preguntas_lectura) => res.status(200).send(preguntas_lectura))
            .catch((error) => { res.status(400).send(error); });
    },
};