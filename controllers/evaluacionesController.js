const evaluaciones = require('../models').evaluaciones_model;
module.exports = {
    list(req, res) {
        return evaluaciones
            .findAll({})
            .then((evaluaciones) => res.status(200).send(evaluaciones))
            .catch((error) => { res.status(400).send(error); });
    },
};