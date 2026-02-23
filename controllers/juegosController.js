const juegos = require('../models').juegos_model;
module.exports = {
    list(req, res) {
        return juegos
            .findAll({})
            .then((juegos) => res.status(200).send(juegos))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return juegos
            .findByPk(req.params.id)
            .then((juegos) => {
                console.log(juegos);
                if (!juegos) {
                    return res.status(404).send({
                        message: 'juegos Not Found',
                    });
                }
                return res.status(200).send(juegos);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};