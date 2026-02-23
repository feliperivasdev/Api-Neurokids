const resultados_preguntas = require('../models').resultados_preguntas_model;
module.exports = {
    list(req, res) {
        return resultados_preguntas
            .findAll({})
            .then((resultados_preguntas) => res.status(200).send(resultados_preguntas))
            .catch((error) => { res.status(400).send(error); });
    },
};