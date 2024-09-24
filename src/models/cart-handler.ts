import { db } from "..";
import { Book, SessionCart } from "../types";

export class CartHandler{
    private cart: SessionCart;

    constructor(sessionCart: SessionCart | undefined){
        this.cart = sessionCart ? sessionCart : { items: {} }
    }

    async addBook(bookId: number, quantity: number): Promise<SessionCart | null>{
        let book: Book

        try{
            book = await db.getBookById(bookId)
        }
        catch{
            return null
        }

        if(book){
            let newQuantity = this.cart.items[bookId] && this.cart.items[bookId].quantity ? this.cart.items[bookId].quantity + quantity : quantity
            if(newQuantity > book.quantity) newQuantity = book.quantity
            this.cart.items[bookId] = { quantity: newQuantity, maxQuantity: book.quantity }
            return this.cart
        }

        return null
    }

    changeQuantity(bookId: number, newQuantity: number): SessionCart | null {
        if(!this.cart.items[bookId]) return null

        const maxQuantity = this.cart.items[bookId].maxQuantity
        if(maxQuantity){
            this.cart.items[bookId].quantity = newQuantity > maxQuantity ? maxQuantity : newQuantity
            return this.cart
        }

        return null
    }

    deleteBook(bookId: any): SessionCart{
        delete this.cart.items[bookId]
        return this.cart
    }

    clear(): SessionCart {
        this.cart = { items: {} }
        return this.cart
    }
}
