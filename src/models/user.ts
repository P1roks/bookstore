import { Cart } from "./cart"

class User{
    private id;
    private username;
    private cart;

    constructor(id, username){
        this.id = id
        this.username = username
        this.cart = new Cart()
    }

    addToCart(bookId, quantity){

    }

    clearCart(){

    }
}
