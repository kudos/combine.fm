import mongodb from 'mongodb-promisified';
const MongoClient = mongodb().MongoClient;
import debuglog from 'debug';
const debug = debuglog('match.audio');

const uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/match-audio';

export default function* () {
  const client = yield MongoClient.connect(uristring);
  debug('Successfully connected to Mongodb');
  client.matches = client.collection('matches');
  return client;
};
