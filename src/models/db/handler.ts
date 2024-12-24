import { Database, BookProperty, IBook, CategoryInfoFull, IUser, User, SessionCart, CartItem, IBookListItem, ILanguage, ICategory, IBookFull } from "../../types"
import bcrypt from 'bcrypt';
import { bookSchema, categorySchema, languageSchema, userSchema } from "./schemas";
import { Model, model, Types } from "mongoose";

export class DatabaseHandler{
    private User: Model<IUser>
    private Language: Model<ILanguage>
    private Category: Model<ICategory>
    private Book: Model<IBook>
    private static _categories: ICategory[]
    private static _languages: ILanguage[]
    private static readonly _states: BookProperty[] =
    [
        {
            id: 1,
            name: "nowy",
            checked: false,
        },
        {
            id: 2,
            name: "bardzo dobry",
            checked: false,
        },
        {
            id: 3,
            name: "dobry",
            checked: false,
        },
        {
            id: 4,
            name: "zniszczony",
            checked: false,
        }
    ]

    public static readonly getCategoriesObject = () => structuredClone(DatabaseHandler._categories)
    public static readonly getStatesObject = () => structuredClone(DatabaseHandler._states)
    public static readonly getLanguagesObject = () => structuredClone(DatabaseHandler._languages)
    private static bookListItemProjection = {title: 1, author: 1, price: 1, state: 1}

    // Use DatabaseHandler.setup instead of normal constructor
    private constructor(){
        this.User = model<IUser>("User", userSchema)
        this.Language = model<ILanguage>("Language", languageSchema)
        this.Category = model<ICategory>("Category", categorySchema)
        this.Book = model<IBook>("Book", bookSchema)
    }

    static async setup(database: Database): Promise<DatabaseHandler>{
        const handler = new DatabaseHandler();
        DatabaseHandler._categories = await handler.getCategories()
        DatabaseHandler._languages = await handler.getLanguages()
        return handler
    }

    async getUser(email: string): Promise<IUser | null>
    async getUser(id: Types.ObjectId): Promise<IUser | null>
    async getUser(data: string | Types.ObjectId): Promise<IUser | null>{
        switch(typeof data){
            case "string":
                return await this.User.findOne({email: data})
            case "object":
                return await this.User.findById(data)
            default:
                throw new Error(`Wrong type provided to getUser function! Provided type: ${typeof data}`)
        }
    }

    async checkUserCredentials({email, password}: IUser): Promise<boolean>{
        try{
            const maybeUser = await this.getUser(email)
            const savedPassword = maybeUser?.password || ""
            return await bcrypt.compare(password, savedPassword)
        }
        catch(error){
            // user not found
            return false
        }
    }

    async addUser({email, password}: IUser): Promise<Types.ObjectId>{
        return (await new this.User({email, password}).save())._id
    }

    async getCategories(): Promise<ICategory[]>{
        return await this.Category.find()
    }

    async getLanguages(): Promise<ILanguage[]>{
        return await this.Language.find()
    }

    async getFullCategoryInfo(id: Types.ObjectId): Promise<ICategory | null>{
        return await this.Category.findById(id)
    }

    async getRandomBooks(quantity: number): Promise<IBookListItem[]>{
        return this.Book.aggregate([
            { $sample: { size: quantity }},
            { $project: DatabaseHandler.bookListItemProjection}
        ])
    }

    async getBooksWithConstraint(constraint: string): Promise<IBookListItem[]>{
        throw new Error("TODO!")
        // let whereClause = constraint.length ? `WHERE ${constraint}` : "";
        // return (await this.database.query(`
        //     SELECT
        //         books.id,
        //         books.title,
        //         books.author,
        //         books.state,
        //         books.price,
        //         books.quantity
        //     FROM books
        //     JOIN categories ON books.category_id = categories.id
        //     JOIN subcategories ON books.subcategory_id = subcategories.id
        //     JOIN languages ON books.language_id = languages.id
        //     ${whereClause};`)
        // ) as IBookListItem[]
    }

    async getBooksByTome(book: IBook): Promise<IBookListItem[]> {
        return this.Book.find(
            {$and: [
                {"tome_info.tome_group": book.tome_info?.tome_group},
                {$not: {_id: book._id}}
            ]},
            DatabaseHandler.bookListItemProjection,
            {sort: {"tome_info.tome_number": 1}}
        )
        // return (await this.database.formattedQuery(`
        //     SELECT
        //         id,
        //         title,
        //         author,
        //         state,
        //         price
        //     FROM books
        //     WHERE tome_group = ? AND id != ?
        //     ORDER BY tome_number ASC;`, [book.tomeGroup, book.id])
        // ) as IBookListItem[]
    }

    async getBookById(id: Types.ObjectId): Promise<IBookFull | null> {
        const aggregatePipeline = [
            {
                $match: {_id: id}
            },
            {
                $lookup: {
                    from: "languages",
                    localField: "language",
                    foreignField: "_id",
                    as: "languageData",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryData",
                },
            },
            {
                $unwind: "$languageData",
            },
            {
                $unwind: "$categoryData",
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    author: 1,
                    description: 1,
                    language: "$languageData.name",
                    category: "$categoryData.name",
                    subcategories: {
                        $map: {
                            input: "$categoryData.subcategories",
                            as: "subcategory",
                            in: "$$subcategory.name",
                        },
                    },
                    state: 1,
                    price: 1,
                    quantity: 1,
                    tome_info: 1,
                },
            },
        ];

        return await this.Book.aggregate(aggregatePipeline)[0] as IBookFull
    }

    async getCartItems(cartSession: SessionCart | undefined): Promise<CartItem[]>{
        if(!cartSession || Object.keys(cartSession.items).length === 0 ) return []

        const selectedIds = Object.keys(cartSession.items).join(',')
        const cartItems = await this.database.query(`
            SELECT
                b.id,
                b.title,
                b.price,
                b.quantity as maxQuantity
            FROM books b
            WHERE b.id IN (${selectedIds});`) as CartItem[]

        Object.entries(cartSession.items)
            .forEach(([bookId, {quantity}]) => {
                const found = cartItems.find(book => book.id === Number(bookId))
                if(found) found.quantity = quantity
            })

        return cartItems
    }

    async updateBooksPostPurchase(cartSession: SessionCart | undefined){
        if(!cartSession || Object.keys(cartSession.items).length === 0 ) return []

        const selectedIds = Object.keys(cartSession.items).join(',')
        const caseStatemets =
            Object
            .entries(cartSession.items)
            .map(([bookId, {quantity}]) => this.database.format(`WHEN id=? THEN quantity - ?`, [bookId, quantity]))
            .join("\n")

        this.database.query(`
            UPDATE books
            SET quantity = CASE
                ${caseStatemets}
                ELSE quantity
            END
            WHERE id IN (${selectedIds})
        `)
    }
}
