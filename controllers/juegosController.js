const juegos = require('../models').juegos_model;
module.exports = {
    list(req, res) {
        return juegos
            .findAll({})
            .then((juegos) => res.status(200).send(juegos))
            .catch((error) => { res.status(400).send(error); });
    },
};