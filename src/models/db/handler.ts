import { BookProperty, IBook, IUser, ISessionCart, IBookListItem, ILanguage, ICategoryFull, IBookFull, ICartItem, SessionUser, ICategory } from "../../types"
import bcrypt from 'bcrypt';
import { bookSchema, categorySchema, userSchema } from "./schemas";
import { connect, Model, model, Types } from "mongoose";

export class DatabaseHandler{
    private User: Model<IUser>
    private Category: Model<ICategoryFull>
    private Book: Model<IBook>
    private static _categories: ICategory[]

    public static readonly getCategoriesObject = () => JSON.parse(JSON.stringify(DatabaseHandler._categories))
    private static bookListItemProjection = {title: 1, author: 1, price: 1, state: 1, image: 1}

    // Use DatabaseHandler.setup instead of normal constructor
    private constructor(){
        this.User = model<IUser>("User", userSchema)
        this.Category = model<ICategoryFull>("Category", categorySchema)
        this.Book = model<IBook>("Book", bookSchema)
    }

    static async setup(database: string | undefined): Promise<DatabaseHandler>{
        if(!database) throw new Error("Database must be specified!")
        await connect(`mongodb://127.0.0.1:27017/${database}`)
        const handler = new DatabaseHandler()
        DatabaseHandler._categories = await handler.getCategories()
        return handler
    }

    async getUser(email: string): Promise<SessionUser>
    async getUser(id: Types.ObjectId): Promise<SessionUser>
    async getUser(data: string | Types.ObjectId): Promise<SessionUser>{
        let user: SessionUser | null
        switch(typeof data){
            case "string":
                user = await this.User.findOne({email: data}, {email: 1})
                break;
            case "object":
                user = await this.User.findById(data, {email: 1})
                break
            default:
                throw new Error(`Wrong type provided to getUser function! Provided type: ${typeof data}`)
        }
        if(!user) throw new Error("User not found!")
        return user
    }

    async checkUserCredentials({email, password}: IUser): Promise<boolean>{
        try{
            const maybeUser: IUser | null = await this.User.findOne({email})
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
        return await this.Category.find({}, {_id: 1, name: 1})
    }

    async getFullCategoryInfo(id: Types.ObjectId): Promise<ICategoryFull | null>{
        return await this.Category.findById(id)
    }

    async getRandomBooks(quantity: number): Promise<IBookListItem[]>{
        return await this.Book.aggregate([
            { $sample: { size: quantity }},
            { $project: DatabaseHandler.bookListItemProjection}
        ])
    }

    async getBooksWithConstraint(filter): Promise<IBookListItem[]>{
        return await this.Book.find(filter, DatabaseHandler.bookListItemProjection)
    }

    async getBooksByTome(book: IBook | IBookFull): Promise<IBookListItem[]> {
        return await this.Book.find(
            {$and: [
                {tomeGroup: book.tomeGroup},
                {_id: {$ne: book._id} }
            ]},
            DatabaseHandler.bookListItemProjection,
            {sort: {"tome_info.tome_number": 1}}
        )
    }

    async getBookById(id: Types.ObjectId): Promise<IBookFull> {
        const aggregatePipeline = [
            {
                $match: {_id: id}
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
                $unwind: "$categoryData",
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    author: 1,
                    description: 1,
                    language: 1,
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
                    tomeNumber: 1,
                    tomeGroup: 1,
                    image: 1,
                },
            },
        ];

        return (await this.Book.aggregate(aggregatePipeline))[0]
    }

    async getCartItems(cartSession: ISessionCart | undefined): Promise<ICartItem[]>{
        if(!cartSession || Object.keys(cartSession.items).length === 0 ) return []

        const selectedIds = Object.keys(cartSession.items).map(key => new Types.ObjectId(key))
        const cartItems: ICartItem[] = await this.Book.find({_id: {$in: selectedIds}}, {_id: 1, title: 1, price: 1, quantity: 1, image: 1})

        cartItems.forEach(cartItem => {
            cartItem.orderQuantity = cartSession.items[cartItem._id].orderQuantity
        })

        return cartItems
    }

    async updateBooksPostPurchase(cartSession: ISessionCart | undefined){
        if(!cartSession || Object.keys(cartSession.items).length === 0 ) return []

        const bulkOperations = 
        Object.entries(cartSession.items)
        .map(([bookId, {orderQuantity, quantity}]) => {
            return {
                    updateOne: {
                        filter: {_id: new Types.ObjectId(bookId) },
                        update: {quantity: quantity - orderQuantity}
                    }
                }
        })

        await this.Book.bulkWrite(bulkOperations)
    }
}
