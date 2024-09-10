import { Cart } from "./cart.mjs"

class User{
    #id
    #username
    #cart

    constructor(id, username){
        this.#id = id
        this.#username = username
        this.#cart = new Cart()
    }

    get id(){
        return this.#id
    }

    get username(){
        return this.#username
    }

    get cart(){
        return this.#cart
    }

    addToCart(bookId, quantity){

    }

    clearCart(){

    }
}
