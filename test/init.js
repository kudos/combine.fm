import co from 'co';
import models from '../models';

import debugname from 'debug';
const debug = debugname('match.audio:db');

co(function *sync() {
  debug('Syncing schema');
  yield models.sequelize.sync();
  debug('Schema synced');
});
