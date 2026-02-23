const preguntas_evaluacion = require('../models').preguntas_evaluacion_model;
module.exports = {
    list(req, res) {
        return preguntas_evaluacion
            .findAll({})
            .then((preguntas_evaluacion) => res.status(200).send(preguntas_evaluacion))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return preguntas_evaluacion
            .findByPk(req.params.id)
            .then((preguntas_evaluacion) => {
                console.log(preguntas_evaluacion);
                if (!preguntas_evaluacion) {
                    return res.status(404).send({
                        message: 'preguntas_evaluacion Not Found',
                    });
                }
                return res.status(200).send(preguntas_evaluacion);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};