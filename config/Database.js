import { Sequelize } from "sequelize";

const db = new Sequelize('learn_jwt_auth', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
});

export default db;