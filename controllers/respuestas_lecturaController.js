const respuestas_lectura = require('../models').respuestas_lectura_model;
module.exports = {
    list(req, res) {
        return respuestas_lectura
            .findAll({})
            .then((respuestas_lectura) => res.status(200).send(respuestas_lectura))
            .catch((error) => { res.status(400).send(error); });
    },
};