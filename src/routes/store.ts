import { Request, Router } from "express";
import { db } from "..";
import { DatabaseHandler } from "../models/db/handler";
import { toNumber, toObjectId, wrapArray } from "../utils";
import { IBookListItem, ISearchParams } from "../types";
import { SearchHandler } from "../models/search-handler";
import { ObjectId } from "mongodb";

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
    try{
        if(!ObjectId.isValid(req.params.bookId)){
            return next() // 404
        }
        const bookId = new ObjectId(req.params.bookId)
        const book = await db.getBookById(bookId)
        if(book){
            let tomeBooks: IBookListItem[] = []

            if(book.tomeGroup){
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

    next() // 404
})

storeRouter.get("/search", (req, _, next) => {
    // parse query params to be of SearchQueryParams type
    const result: ISearchParams = {};

    for (const [key, val] of Object.entries(req.query)) {
        let converted
        switch (key as keyof ISearchParams){
            case "category":
            case "subcategories":
                converted = toObjectId(val as string)
                break
            case "title":
                if(typeof val === "string"){
                    converted = val
                }
                break
            case "minPrice":
            case "maxPrice":
            case "sort":
                converted = toNumber(val)
                break
            default:
                if(["language", "state"].includes(key)){
                    if(!result.extraFields) result.extraFields = []
                    result.extraFields.push({
                        name: key,
                        values: (Array.isArray(val) ? val : wrapArray(val as string)) as string[]
                    })
                }
                break
        }
        if(converted){
            result[key] = converted
        }
    }

    req.query = result as any;
    next()
}, async (req: Request<{}, {}, {}, ISearchParams>, res, next) => {
    // search page, display books based on search params
    try {
        const handler = new SearchHandler(req.query);
        const books = await handler.getFilteredBooks()
        const filters = await handler.getCurrentFilters()
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
