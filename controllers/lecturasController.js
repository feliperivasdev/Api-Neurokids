const lecturas = require('../models').lecturas_model;
module.exports = {
    list(req, res) {
        return lecturas
            .findAll({})
            .then((lecturas) => res.status(200).send(lecturas))
            .catch((error) => { res.status(400).send(error); });
    },
};