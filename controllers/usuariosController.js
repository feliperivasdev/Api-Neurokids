const usuarios = require('../models').usuarios_model;
module.exports = {
    list(req, res) {
        return usuarios
            .findAll({})
            .then((usuarios) => res.status(200).send(usuarios))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return usuarios
            .findByPk(req.params.id)
            .then((usuarios) => {
                console.log(usuarios);
                if (!usuarios) {
                    return res.status(404).send({
                        message: 'usuarios Not Found',
                    });
                }
                return res.status(200).send(usuarios);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};