"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseHandler = void 0;
class DatabaseHandler {
    #database;
    constructor(database) {
        this.#database = database;
    }
    async checkUserCredentials(email, plainPassword) {
    }
}
exports.DatabaseHandler = DatabaseHandler;
