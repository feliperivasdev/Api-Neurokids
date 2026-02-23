const resultados_preguntas = require('../models').resultados_preguntas_model;
module.exports = {
    list(req, res) {
        return resultados_preguntas
            .findAll({})
            .then((resultados_preguntas) => res.status(200).send(resultados_preguntas))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return resultados_preguntas
            .findByPk(req.params.id)
            .then((resultados_preguntas) => {
                console.log(resultados_preguntas);
                if (!resultados_preguntas) {
                    return res.status(404).send({
                        message: 'resultados_preguntas Not Found',
                    });
                }
                return res.status(200).send(resultados_preguntas);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};