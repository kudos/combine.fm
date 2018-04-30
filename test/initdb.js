import co from 'co';
import models from '../models';

import debugname from 'debug';
const debug = debugname('match.audio:db');

co(async function sync() {
  debug('Syncing schema');
  await models.sequelize.sync();
  debug('Schema synced');
});
