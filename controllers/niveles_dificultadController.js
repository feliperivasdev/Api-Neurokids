const niveles_dificultad = require('../models').niveles_difucultad_model;
module.exports = {
    list(req, res) {
        return niveles_dificultad
            .findAll({})
            .then((niveles_dificultad) => res.status(200).send(niveles_dificultad))
            .catch((error) => { res.status(400).send(error); });
    },
};