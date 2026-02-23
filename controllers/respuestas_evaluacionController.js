const respuestas_evaluacion = require('../models').respuestas_evaluacion_model;
module.exports = {
    list(req, res) {
        return respuestas_evaluacion
            .findAll({})
            .then((respuestas_evaluacion) => res.status(200).send(respuestas_evaluacion))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return respuestas_evaluacion
            .findByPk(req.params.id)
            .then((respuestas_evaluacion) => {
                console.log(respuestas_evaluacion);
                if (!respuestas_evaluacion) {
                    return res.status(404).send({
                        message: 'respuestas_evaluacion Not Found',
                    });
                }
                return res.status(200).send(respuestas_evaluacion);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};