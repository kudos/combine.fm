export default function (sequelize, DataTypes) {
  const Album = sequelize.define('album', {
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
  }, {
    paranoid: true,
    classMethods: {
      associate: (models) => {
        Album.hasMany(models.match);
        Album.belongsTo(models.artist);
      },
    },
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

  return Album;
}
