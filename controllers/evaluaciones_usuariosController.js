const evaluaciones_usuarios = require('../models').evaluaciones_usuarios_model;
module.exports = {
    list(req, res) {
        return evaluaciones_usuarios
            .findAll({})
            .then((evaluaciones_usuarios) => res.status(200).send(evaluaciones_usuarios))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return evaluaciones_usuarios
            .findByPk(req.params.id)
            .then((evaluaciones_usuarios) => {
                console.log(evaluaciones_usuarios);
                if (!evaluaciones_usuarios) {
                    return res.status(404).send({
                        message: 'evaluaciones_usuarios Not Found',
                    });
                }
                return res.status(200).send(evaluaciones_usuarios);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};