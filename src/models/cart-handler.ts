import { ObjectId } from "mongodb";
import { db } from "..";
import { IBookFull, ISessionCart } from "../types";

export class CartHandler{
    private cart: ISessionCart;
    private setCart: (cart: ISessionCart) => undefined

    constructor(sessionCart: ISessionCart | undefined, setCart: (cart: ISessionCart) => undefined){
        this.cart = sessionCart ? sessionCart : { items: {} }
        this.setCart = setCart
    }

    async addBook(bookId: string, quantity: number){
        let book: IBookFull

        try{
            book = await db.getBookById(new ObjectId(bookId))
        }
        catch{ return }

        if(book){
            let newQuantity = this.cart.items[bookId] && this.cart.items[bookId].orderQuantity ? this.cart.items[bookId].orderQuantity + quantity : quantity
            if(newQuantity > book.quantity) newQuantity = book.quantity
            this.cart.items[bookId] = { orderQuantity: newQuantity, quantity: book.quantity }
            this.setCart(this.cart)
        }
    }

    changeQuantity(bookId: string, newQuantity: number){
        if(!this.cart.items[bookId]) return

        const maxQuantity = this.cart.items[bookId].quantity
        if(maxQuantity){
            this.cart.items[bookId].orderQuantity = newQuantity > maxQuantity ? maxQuantity : newQuantity
            this.setCart(this.cart)
        }
    }

    deleteBook(bookId: any){
        delete this.cart.items[bookId]
        this.setCart(this.cart)
    }

    async purchase(){
       await db.updateBooksPostPurchase(this.cart) 
       this.clear()
    }

    clear(){
        this.cart = { items: {} }
        this.setCart(this.cart)
    }
}
