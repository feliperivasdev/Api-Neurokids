const usuarios = require('../models').usuarios_model;
module.exports = {
    list(req, res) {
        return usuarios
            .findAll({})
            .then((usuarios) => res.status(200).send(usuarios))
            .catch((error) => { res.status(400).send(error); });
    },
};