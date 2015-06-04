'use strict';
const debug = require('debug')('match.audio');

// Shut mongodb-promisified up.
const dir = console.dir;
console.dir = function() {};
const MongoClient = require('mongodb-promisified')().MongoClient;
console.dir = dir;

const uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/match-audio';

module.exports = function*() {
  const client = yield MongoClient.connect(uristring);
  debug('Successfully connected to Mongodb');
  client.matches = client.collection('matches');
  return client;
};
