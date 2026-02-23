const instituciones = require('../models').instituciones_model;
module.exports = {
    list(req, res) {
        return instituciones
            .findAll({})
            .then((instituciones) => res.status(200).send(instituciones))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return instituciones
            .findByPk(req.params.id)
            .then((instituciones) => {
                console.log(instituciones);
                if (!instituciones) {
                    return res.status(404).send({
                        message: 'instituciones Not Found',
                    });
                }
                return res.status(200).send(instituciones);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};