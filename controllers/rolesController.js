const roles = require('../models').roles_model;
module.exports = {
    list(req, res) {
        return roles
            .findAll({})
            .then((roles) => res.status(200).send(roles))
            .catch((error) => { res.status(400).send(error); });
    },
    getById(req, res) {

        console.log(req.params.id);
        return roles
            .findByPk(req.params.id)
            .then((roles) => {
                console.log(roles);
                if (!roles) {
                    return res.status(404).send({
                        message: 'roles Not Found',
                    });
                }
                return res.status(200).send(roles);
            })
            .catch((error) =>
                res.status(400).send(error));
    },
};