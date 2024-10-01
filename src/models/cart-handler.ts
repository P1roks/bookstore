import { db } from "..";
import { BookDetail, SessionCart } from "../types";

export class CartHandler{
    private cart: SessionCart;
    private setCart: (cart: SessionCart) => undefined

    constructor(sessionCart: SessionCart | undefined, setCart: (cart: SessionCart) => undefined){
        this.cart = sessionCart ? sessionCart : { items: {} }
        this.setCart = setCart
    }

    async addBook(bookId: number, quantity: number){
        let book: BookDetail

        try{
            book = await db.getBookById(bookId)
        }
        catch{ return }

        if(book){
            let newQuantity = this.cart.items[bookId] && this.cart.items[bookId].quantity ? this.cart.items[bookId].quantity + quantity : quantity
            if(newQuantity > book.quantity) newQuantity = book.quantity
            this.cart.items[bookId] = { quantity: newQuantity, maxQuantity: book.quantity }
            this.setCart(this.cart)
        }
    }

    changeQuantity(bookId: number, newQuantity: number){
        if(!this.cart.items[bookId]) return

        const maxQuantity = this.cart.items[bookId].maxQuantity
        if(maxQuantity){
            this.cart.items[bookId].quantity = newQuantity > maxQuantity ? maxQuantity : newQuantity
            this.setCart(this.cart)
        }
    }

    deleteBook(bookId: any){
        delete this.cart.items[bookId]
        this.setCart(this.cart)
    }

    clear(){
        this.cart = { items: {} }
        this.setCart(this.cart)
    }
}
