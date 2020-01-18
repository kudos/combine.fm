import services from './services.js';

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
