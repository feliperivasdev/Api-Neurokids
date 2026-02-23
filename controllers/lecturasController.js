const lecturas = require('../models').lecturas_model;
module.exports = {
    list(req, res) {
        return lecturas
            .findAll({})
            .then((lecturas) => res.status(200).send(lecturas))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return lecturas
            .findByPk(req.params.id)
            .then((lecturas) => {
                console.log(lecturas);
                if (!lecturas) {
                    return res.status(404).send({
                        message: 'lecturas Not Found',
                    });
                }
                return res.status(200).send(lecturas);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};