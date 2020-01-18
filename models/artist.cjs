module.exports = function (sequelize, DataTypes) {
  const Artist = sequelize.define('artist', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.TEXT,
    streamUrl: DataTypes.TEXT,
    purchaseUrl: DataTypes.TEXT,
    artworkSmall: DataTypes.TEXT,
    artworkLarge: DataTypes.TEXT,
  }, {
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
      },
    ],
  });

  Artist.associate = function associate(models) {
    Artist.hasMany(models.track);
    Artist.hasMany(models.album);
  };

  return Artist;
}
