import { Request, Router } from "express";
import { db } from "..";
import { DatabaseHandler } from "../models/db/handler";
import { SearchHandler, SearchQueryParams } from "../models/search-handler";
import { toNumber, toNumberArray, wrapArray } from "../utils";
import { BookListItem } from "../types";

export const storeRouter = Router()

storeRouter.get("/", async (req, res, next) => {
    // front page, display random books
    try {
        const books = await db.getRandomBooks(20);
        return res.render("mainpage", { books, categories: DatabaseHandler.getCategoriesObject(), user: req.session.user, cart: req.session.cart})
    }
    catch(error){
        return next(error)
    }
})

storeRouter.get("/book/:bookId", async (req, res, next) => {
    // display info about given book
    const bookId = parseInt(req.params.bookId, 10)

    if(!isNaN(bookId)){
        try{
            const book = await db.getBookById(bookId)
            if(book){
                let tomeBooks: BookListItem[] = []

                if(book.tomeGroup !== null){
                    tomeBooks = await db.getBooksByTome(book)
                }

                return res.render("bookDetails", {
                    book,
                    tomeBooks,
                    categories: DatabaseHandler.getCategoriesObject(),
                    user: req.session.user,
                    cart: req.session.cart
                })
            }
        }
        catch(error){
            next(error)
        }
    }

    next() // 404
})

storeRouter.get("/search", (req, _, next) => {
    // parse query params to be of SearchQueryParams type
    const validKeys: { [key in keyof SearchQueryParams]: (value: any) => SearchQueryParams[key] | undefined } = {
        category: toNumber,
        subcategory: toNumber,
        state: value => Array.isArray(value) ? toNumberArray(value) : wrapArray(toNumber(value)),
        language: value => Array.isArray(value) ? toNumberArray(value) : wrapArray(toNumber(value)),
        title: value => value,
        minPrice: toNumber,
        maxPrice: toNumber,
    };

    const result: SearchQueryParams = {};

    for (const [key, val] of Object.entries(req.query)) {
        if (key in validKeys) {
            const converted = validKeys[key](val)
            if(converted){
                result[key] = converted
            }
        }
    }

    req.query = result as any;
    next()
}, async (req: Request<{}, {}, {}, SearchQueryParams>, res, next) => {
    // search page, display books based on search params
    try {
        const handler = new SearchHandler(req.query);
        let books = await handler.getFilteredBooks()
        let filters = await handler.getFiltersState()
        res.render("search", {
            books,
            categories: DatabaseHandler.getCategoriesObject(),
            user: req.session.user,
            cart: req.session.cart,
            filters,
        })
    }
    catch(error) {
        next(error)
    }
})
