const rangos_edad = require('../models').rangos_edad_model;
module.exports = {
    list(req, res) {
        return rangos_edad
            .findAll({})
            .then((rangos_edad) => res.status(200).send(rangos_edad))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return rangos_edad
            .findByPk(req.params.id)
            .then((rangos_edad) => {
                console.log(rangos_edad);
                if (!rangos_edad) {
                    return res.status(404).send({
                        message: 'rangos_edad Not Found',
                    });
                }
                return res.status(200).send(rangos_edad);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};