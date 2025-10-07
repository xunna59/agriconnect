'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farmer_profile', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      farmName: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      bio: { type: Sequelize.TEXT },
      coverPhoto: { type: Sequelize.STRING },

      // Payout account fields
      accountName: { type: Sequelize.STRING, allowNull: true },
      mobileMoneyNumber: { type: Sequelize.STRING, allowNull: true },
      mobileMoneyProvider: { type: Sequelize.STRING, allowNull: true },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('farmer_profile');
  },
};
