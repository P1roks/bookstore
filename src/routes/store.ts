import { Request, Router } from "express";
import { db, pageNotFound } from "..";
import { DatabaseHandler } from "../models/db/handler";
import { SearchHandler, SearchQueryParams } from "../models/search-handler";
import { toNumber, toNumberArray } from "../utils";

export const storeRouter = Router()

storeRouter.get("/", async (req, res, next) => {
    // front page, display random books
    try {
        const books = await db.getRandomBooks(20);
        res.render("mainpage", { books, categories: DatabaseHandler.getCategoriesObject(), user: req.session.user, cart: undefined})
    }
    catch(error){
        next(error)
    }
})

storeRouter.get("/book/:bookId", async (req, res) => {
    // display info about given book
    const bookId = parseInt(req.params.bookId, 10)
    if(isNaN(bookId)){
        return pageNotFound(req, res)
    }

    try{
        const book = await db.getBookById(bookId)
        if(!book) return pageNotFound(req, res)
        res.render("bookDetails", {
            book,
            categories: DatabaseHandler.getCategoriesObject(),
            user: req.session.user,
            cart: undefined
        })
    }
    catch(error){
        return pageNotFound(req, res)
    }
})

storeRouter.get("/search", (req, _, next) => {
    // parse query params to be of SearchQueryParams type
    const validKeys: { [key in keyof SearchQueryParams]: (value: any) => SearchQueryParams[key] | undefined } = {
        category: toNumber,
        subcategory: toNumber,
        state: value => Array.isArray(value) ? toNumberArray(value) : toNumber(value),
        language: value => Array.isArray(value) ? toNumberArray(value) : toNumber(value),
        title: value => value,
        minPrice: toNumber,
        maxPrice: toNumber,
    };

    const result: SearchQueryParams = {};

    for (const [key, val] of Object.entries(req.query)) {
        if (key in validKeys) {
            let converted = validKeys[key](val)
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
        let filters = await handler.getFilters()
        res.render("search", {
            books,
            categories: DatabaseHandler.getCategoriesObject(),
            user: req.session.user,
            cart: undefined,
            filters,
        })
    }
    catch(error) {
        next(error)
    }
})
