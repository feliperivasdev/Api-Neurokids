const evaluaciones_usuarios = require('../models').evaluaciones_usuarios_model;
module.exports = {
    list(req, res) {
        return evaluaciones_usuarios
            .findAll({})
            .then((evaluaciones_usuarios) => res.status(200).send(evaluaciones_usuarios))
            .catch((error) => { res.status(400).send(error); });
    },
};