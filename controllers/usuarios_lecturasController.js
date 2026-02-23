const usuarios_lecturas = require('../models').usuarios_lecturas_model;
module.exports = {
    list(req, res) {
        return usuarios_lecturas
            .findAll({})
            .then((usuarios_lecturas) => res.status(200).send(usuarios_lecturas))
            .catch((error) => { res.status(400).send(error); });
    },
};