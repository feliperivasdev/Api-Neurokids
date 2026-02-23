const insignias = require('../models').insignias_model;
module.exports = {
    list(req, res) {
        return insignias
            .findAll({})
            .then((insignias) => res.status(200).send(insignias))
            .catch((error) => { res.status(400).send(error); });
    },
};