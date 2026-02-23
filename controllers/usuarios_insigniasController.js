const usuarios_insignias = require('../models').usuarios_insignias_model;
module.exports = {
    list(req, res) {
        return usuarios_insignias
            .findAll({})
            .then((usuarios_insignias) => res.status(200).send(usuarios_insignias))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return usuarios_insignias
            .findByPk(req.params.id)
            .then((usuarios_insignias) => {
                console.log(usuarios_insignias);
                if (!usuarios_insignias) {
                    return res.status(404).send({
                        message: 'usuarios_insignias Not Found',
                    });
                }
                return res.status(200).send(usuarios_insignias);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};