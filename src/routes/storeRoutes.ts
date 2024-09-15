import { Router } from "express";
import { db } from "..";
import { DatabaseHandler } from "../models/db/handler";

export const storeRouter = Router()

storeRouter.get("/", async (req, res) => {
    // front page, display random books
    let books = await db.getRandomBooks(20);
    res.render("mainpage", { books, categories: DatabaseHandler.categories, user: undefined, cart: undefined})
})

storeRouter.get("/search", (req, res) => {
    // search books page
    /* let searchParams: SearchParams = {
        
    }
    let books = db.searchBooks(req.query as SearchParams); */
    res.render("search")
})

storeRouter.get("/book/:bookId", (req, res) => {
    // display info about given book
    let bookId = req.params.bookId
})
