import moment from 'moment';
import { Op } from 'sequelize';

import { Signup } from '../models/signup';

export default async function deleteUnconfirmedSignups() {
  const signups = await Signup.unscoped().findAll({
    where: {
      [Op.and]: {
        // Is not confirmed
        confirmedAt: {
          [Op.eq]: null,
        },
        // Over 30 minutes old
        createdAt: {
          [Op.lt]: moment().subtract(30, 'minutes').toDate(),
        },
      },
    },
    // Also already-deleted signups
    paranoid: false,
  });

  if (signups.length === 0) {
    console.log('No unconfirmed signups to delete');
    return;
  }

  const ids = signups.map((signup) => signup.id);

  console.log('Deleting unconfirmed signups:');
  console.log(ids);
  try {
    // TODO: send emails to signups accepted from queue
    await Signup.unscoped().destroy({
      where: { id: ids },
      // skip deletion grace period
      force: true,
    });
    console.log('Unconfirmed signups deleted');
  } catch (error) {
    console.error(error);
  }
}
