const usuarios_lecturas = require('../models').usuarios_lecturas_model;
module.exports = {
    list(req, res) {
        return usuarios_lecturas
            .findAll({})
            .then((usuarios_lecturas) => res.status(200).send(usuarios_lecturas))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return usuarios_lecturas
            .findByPk(req.params.id)
            .then((usuarios_lecturas) => {
                console.log(usuarios_lecturas);
                if (!usuarios_lecturas) {
                    return res.status(404).send({
                        message: 'usuarios_lecturas Not Found',
                    });
                }
                return res.status(200).send(usuarios_lecturas);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};