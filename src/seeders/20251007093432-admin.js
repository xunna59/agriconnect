'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT * FROM users WHERE email = 'admin@farmconnect.com'`
    );

    const hashedPassword = await bcrypt.hash('zxcvbnm', 10);

    if (!existingAdmin.length) {
      await queryInterface.bulkInsert('users', [
        {
          id: '0000-0000-0000-0001',
          fullname: 'Farm Connect',
          email: 'admin@farmconnect.com',
          phone: null,
          password: hashedPassword,
          role: 'admin',
          wallet_balance: 0.0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    } else {
      await queryInterface.bulkUpdate(
        'users',
        {
          fullname: 'Farm Connect',
          password: hashedPassword,
          role: 'admin',
          updated_at: new Date(),
        },
        {
          email: 'admin@farmconnect.com',
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@farmconnect.com' }, {});
  }
};
