const instituciones = require('../models').instituciones_model;
module.exports = {
    list(req, res) {
        return instituciones
            .findAll({})
            .then((instituciones) => res.status(200).send(instituciones))
            .catch((error) => { res.status(400).send(error); });
    },
};