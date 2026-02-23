const respuestas_lectura = require('../models').respuestas_lectura_model;
module.exports = {
    list(req, res) {
        return respuestas_lectura
            .findAll({})
            .then((respuestas_lectura) => res.status(200).send(respuestas_lectura))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return respuestas_lectura
            .findByPk(req.params.id)
            .then((respuestas_lectura) => {
                console.log(respuestas_lectura);
                if (!respuestas_lectura) {
                    return res.status(404).send({
                        message: 'respuestas_lectura Not Found',
                    });
                }
                return res.status(200).send(respuestas_lectura);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};