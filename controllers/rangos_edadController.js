const rangos_edad = require('../models').rangos_edad_model;
module.exports = {
    list(req, res) {
        return rangos_edad
            .findAll({})
            .then((rangos_edad) => res.status(200).send(rangos_edad))
            .catch((error) => { res.status(400).send(error); });
    },
};