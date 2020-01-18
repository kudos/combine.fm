module.exports = function (sequelize, DataTypes) {
  const Track = sequelize.define('track', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    externalId: { type: DataTypes.STRING(50), index: true }, // eslint-disable-line new-cap
    service: DataTypes.ENUM( // eslint-disable-line new-cap
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

  Track.associate = function associate(models) {
    Track.hasMany(models.match);
    Track.belongsTo(models.artist);
  };

  return Track;
}
