const niveles_dificultad = require('../models').niveles_difucultad_model;
module.exports = {
    list(req, res) {
        return niveles_dificultad
            .findAll({})
            .then((niveles_dificultad) => res.status(200).send(niveles_dificultad))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return niveles_dificultad
            .findByPk(req.params.id)
            .then((niveles_dificultad) => {
                console.log(niveles_dificultad);
                if (!niveles_dificultad) {
                    return res.status(404).send({
                        message: 'niveles_dificultad Not Found',
                    });
                }
                return res.status(200).send(niveles_dificultad);
            })
            .catch((error) =>
                res.status(400).send(error));
    },

};