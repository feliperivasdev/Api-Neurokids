const usuarios_juegos = require('../models').usuarios_juegos_model;
module.exports = {
    list(req, res) {
        return usuarios_juegos
            .findAll({})
            .then((usuarios_juegos) => res.status(200).send(usuarios_juegos))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return usuarios_juegos
            .findByPk(req.params.id)
            .then((usuarios_juegos) => {
                console.log(usuarios_juegos);
                if (!usuarios_juegos) {
                    return res.status(404).send({
                        message: 'usuarios_juegos Not Found',
                    });
                }
                return res.status(200).send(usuarios_juegos);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};