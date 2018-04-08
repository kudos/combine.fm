export default function (sequelize, DataTypes) {
  const Track = sequelize.define('track', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
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
    artistId: DataTypes.INTEGER,
    albumId: DataTypes.INTEGER,
    albumName: DataTypes.TEXT,
  }, {
    paranoid: true,
    classMethods: {
      associate: (models) => {
        Track.hasMany(models.match);
        Track.belongsTo(models.artist);
      },
    },
    indexes: [
      {
        fields: ['externalId', 'service'],
      },
    ],
    getterMethods: {
      type() {
        return 'track';
      },
    },
  });

  return Track;
}
