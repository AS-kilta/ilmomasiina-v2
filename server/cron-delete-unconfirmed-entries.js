const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = app => {
  const models = app.get('models');
  const { Op } = Sequelize;

  models.signup
    .unscoped()
    .findAll({
      where: {
        [Op.and]: {
          // Is confirmed
          confirmedAt: {
            [Op.eq]: null, // $means ==
          },
          // Over 30 minutes old
          createdAt: {
            [Op.lt]: moment()
              .subtract(30, 'minutes')
              .toDate(),
          },
        },
      },
    })
    .then(r => {
      console.log('Unconfirmed signups: ');
      console.log(r);
      console.log(r.map(s => s.dataValues.id));
      return r.map(s => s.dataValues.id);
    })
    .then(r => {
      r.map(id => {
        models.signup
          .unscoped()
          .destroy({
            where: {
              id,
            },
          })
          .then(res => console.log(res))
          .catch(error => console.log(error));
      });
    });
};
