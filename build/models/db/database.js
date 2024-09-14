"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const promise_1 = require("mysql2/promise");
class Database {
    #pool;
    constructor(data) {
        const { host, port, user, password, database } = data;
        if (!database)
            throw new Error("database must be specified");
        if (!user)
            throw new Error("user must be specified");
        this.#pool = (0, promise_1.createPool)({
            host,
            port,
            user,
            password,
            database,
            connectionLimit: 10,
            multipleStatements: true
        });
    }
    async query(query) {
        const pool = await this.#pool.getConnection();
        let result;
        try {
            result = await pool.query(query);
        }
        catch (error) {
            console.error(error);
            return null;
        }
        return result;
    }
}
exports.Database = Database;
