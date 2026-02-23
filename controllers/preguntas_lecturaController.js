const preguntas_lectura = require('../models').preguntas_lectura_model;
module.exports = {
    list(req, res) {
        return preguntas_lectura
            .findAll({})
            .then((preguntas_lectura) => res.status(200).send(preguntas_lectura))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return preguntas_lectura
            .findByPk(req.params.id)
            .then((preguntas_lectura) => {
                console.log(preguntas_lectura);
                if (!preguntas_lectura) {
                    return res.status(404).send({
                        message: 'preguntas_lectura Not Found',
                    });
                }
                return res.status(200).send(preguntas_lectura);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};