import path from 'path';
import fs from 'fs';

var services = [];

fs.readdirSync(path.join(__dirname, 'services')).forEach(function(file) {
  const service = require(path.join(__dirname, 'services', file));
  if (service.search) {
    services.push(service);
  }
});

export default async function (url) {
  let matchedService;
  for (let service of services) {
    matchedService = service.match(url);
    if (matchedService) {
      const result = await service.parseUrl(url);
      return await service.lookupId(result.id, result.type);
    }
  }
};
