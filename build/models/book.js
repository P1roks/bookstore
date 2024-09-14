"use strict";
class Book {
    #id;
    #data;
    #metadata;
    constructor(id, title, author, description, tome, language, state, quantity, category, subcategories, price) {
        this.#id = id;
        this.#data = new BookData(title, author, description, tome, language);
        this.#metadata = new BookMetadata(state, quantity, category, subcategories, price);
    }
}
class BookData {
    #title;
    #author;
    #description;
    #tome;
    #language;
    constructor(title, author, description, tome, language) {
        this.#title = title;
        this.#author = author;
        this.#description = description;
        this.#tome = tome;
        this.#language = language;
    }
}
class BookMetadata {
    #state;
    #quantity;
    #category;
    #subcategories;
    #price;
    constructor(state, quantity, category, subcategories, price) {
        this.#state = state;
        this.#quantity = quantity;
        this.#category = category;
        this.#subcategories = subcategories;
        this.#price = price;
    }
}
