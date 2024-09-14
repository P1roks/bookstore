"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cart_1 = require("./cart");
class User {
    #id;
    #username;
    #cart;
    constructor(id, username) {
        this.#id = id;
        this.#username = username;
        this.#cart = new cart_1.Cart();
    }
    get id() {
        return this.#id;
    }
    get username() {
        return this.#username;
    }
    get cart() {
        return this.#cart;
    }
    addToCart(bookId, quantity) {
    }
    clearCart() {
    }
}
