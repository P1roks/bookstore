"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
class Cart {
    #items;
    /*
    [
        {
            bookId: 1;
            quantity: 3;
        },
        {
            bookId: 2;
            quantity: 1;
        },
    ]
    */
    constructor() {
        this.#items = [];
    }
    addItem() {
    }
    removeItem(id) {
    }
    clear() {
        this.#items = [];
    }
}
exports.Cart = Cart;
