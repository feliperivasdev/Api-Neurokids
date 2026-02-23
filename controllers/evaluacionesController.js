const evaluaciones = require('../models').evaluaciones_model;
module.exports = {
    list(req, res) {
        return evaluaciones
            .findAll({})
            .then((evaluaciones) => res.status(200).send(evaluaciones))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return evaluaciones
            .findByPk(req.params.id)
            .then((evaluaciones) => {
                console.log(evaluaciones);
                if (!evaluaciones) {
                    return res.status(404).send({
                        message: 'evaluaciones Not Found',
                    });
                }
                return res.status(200).send(evaluaciones);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};