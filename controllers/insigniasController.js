const insignias = require('../models').insignias_model;
module.exports = {
    list(req, res) {
        return insignias
            .findAll({})
            .then((insignias) => res.status(200).send(insignias))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return insignias
            .findByPk(req.params.id)
            .then((insignias) => {
                console.log(insignias);
                if (!insignias) {
                    return res.status(404).send({
                        message: 'insignias Not Found',
                    });
                }
                return res.status(200).send(insignias);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};