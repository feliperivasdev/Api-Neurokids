const usuarios_juegos = require('../models').usuarios_juegos_model;
module.exports = {
    list(req, res) {
        return usuarios_juegos
            .findAll({})
            .then((usuarios_juegos) => res.status(200).send(usuarios_juegos))
            .catch((error) => { res.status(400).send(error); });
    },
};