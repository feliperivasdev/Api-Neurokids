const usuarios_insignias = require('../models').usuarios_insignias_model;
module.exports = {
    list(req, res) {
        return usuarios_insignias
            .findAll({})
            .then((usuarios_insignias) => res.status(200).send(usuarios_insignias))
            .catch((error) => { res.status(400).send(error); });
    },
};