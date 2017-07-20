import path from 'path';
import fs from 'fs';

var services = [];

fs.readdirSync(path.join(__dirname, 'services')).forEach(function(file) {
  const service = require(path.join(__dirname, 'services', file));
  if (service.search) {
    services.push(service);
  }
});

export default function* (url) {
  let matchedService;
  for (let service of services) {
    console.log(service)
    matchedService = service.match(url);
    if (matchedService) {
      const result = yield service.parseUrl(url);
      return yield service.lookupId(result.id, result.type);
    }
  }
};
