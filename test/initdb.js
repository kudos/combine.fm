import co from 'co';
import models from '../models/index.cjs';

import debugname from 'debug';
const debug = debugname('combine.fm:db');

co(async function sync() {
  debug('Syncing schema');
  await models.sequelize.sync();
  debug('Schema synced');
  models.sequelize.close();
});
