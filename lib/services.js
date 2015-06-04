import path from 'path';
import fs from 'fs';

module.exports = [];

fs.readdirSync(path.join(__dirname, 'services')).forEach(function(file) {
  var service = require(path.join(__dirname, 'services', file));
  if (service.search) {
    module.exports.push(service);
  }
});
