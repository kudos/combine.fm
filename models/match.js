export default function (sequelize, DataTypes) {
  const Match = sequelize.define('match', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    trackId: DataTypes.INTEGER,
    albumId: DataTypes.INTEGER,
    externalId: { type: DataTypes.STRING(50), index: true }, // eslint-disable-line new-cap
    service: DataTypes.ENUM( // eslint-disable-line new-cap
      'amazon',
      'deezer',
      'google',
      'itunes',
      'spotify',
      'xbox',
      'youtube'
    ),
    name: DataTypes.TEXT,
    streamUrl: DataTypes.TEXT,
    purchaseUrl: DataTypes.TEXT,
    artworkSmall: DataTypes.TEXT,
    artworkLarge: DataTypes.TEXT,
  }, {
    paranoid: true,
    indexes: [
      {
        fields: ['externalId', 'service'],
      },
    ],
    getterMethods: {
      type() {
        return this.getDataValue('trackId') ? 'track' : 'album';
      },
    },
  });

  return Match;
}
