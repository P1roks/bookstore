import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { IBook, IUser, ISessionCart, IBookListItem, ICategoryFull, IBookFull, ICartItem, SessionUser, ICategory } from "../../types"
import bcrypt from 'bcrypt';

export class DatabaseHandler{
    private cursor: Db
    private User: Collection<IUser>
    private Book: Collection<IBook>
    private Category: Collection<ICategoryFull>
    private static _categories: ICategory[]

    public static readonly getCategoriesObject = () => JSON.parse(JSON.stringify(DatabaseHandler._categories))
    private static bookListItemProjection = {title: 1, author: 1, price: 1, state: 1, image: 1}

    // Use DatabaseHandler.setup instead of normal constructor
    private constructor(client: MongoClient){
        this.cursor = client.db("bookstore")
        this.User = this.cursor.collection<IUser>("users")
        this.Book = this.cursor.collection<IBook>("books")
        this.Category = this.cursor.collection<ICategoryFull>("categories")
    }

    static async setup(database: string | undefined): Promise<DatabaseHandler>{
        if(!database) throw new Error("Database must be specified!")
        const handler = new DatabaseHandler(await new MongoClient(`mongodb://127.0.0.1:27017/${database}`).connect())
        DatabaseHandler._categories = await handler.getCategories()
        return handler
    }

    async getUser(email: string): Promise<SessionUser>
    async getUser(id: ObjectId): Promise<SessionUser>
    async getUser(data: string | ObjectId): Promise<SessionUser>{
        let user: SessionUser | null
        switch(typeof data){
            case "string":
                user = await this.User.findOne({email: data}, {projection: {email: 1}})
                break;
            case "object":
                user = await this.User.findOne({_id: data}, {projection: {email: 1}})
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

    async addUser({email, password}: IUser): Promise<ObjectId>{
        const hashedPassword = await bcrypt.hash(password, 5);
        const inserted = await this.User.insertOne({
            email,
            password: hashedPassword
        })
        return inserted.insertedId
    }

    async getCategories(): Promise<ICategory[]>{
        return await this.Category.find({}, {projection: {_id: 1, name: 1}}).toArray()
    }

    async getFullCategoryInfo(id: ObjectId): Promise<ICategoryFull | null>{
        return await this.Category.findOne({_id: id})
    }

    async getRandomBooks(quantity: number): Promise<IBookListItem[]>{
        return await this.Book.aggregate([
            { $sample: { size: quantity }},
            { $project: DatabaseHandler.bookListItemProjection}
        ]).toArray() as IBookListItem[]
    }

    async getBooksWithConstraint(filter, sort): Promise<IBookListItem[]>{
        return await this.Book.find(filter, {projection: DatabaseHandler.bookListItemProjection, sort}).toArray() as IBookListItem[]
    }

    async getBooksByTome(book: IBook | IBookFull): Promise<IBookListItem[]> {
        return await this.Book.find(
            {$and: [
                {tomeGroup: book.tomeGroup},
                {_id: {$ne: book._id} }
            ]},
            {
                projection: DatabaseHandler.bookListItemProjection,
                sort: {tomeNumber: 1}
            }
        ).toArray()
    }

    async getBookById(id: ObjectId): Promise<IBookFull> {
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

        return (await this.Book.aggregate(aggregatePipeline).toArray() as IBookFull[])[0]
    }

    async getCartItems(cartSession: ISessionCart | undefined): Promise<ICartItem[]>{
        if(!cartSession || Object.keys(cartSession.items).length === 0 ) return []

        const selectedIds: ObjectId[] = Object.keys(cartSession.items).map(key => new ObjectId(key))
        const cartItems: ICartItem[] = await this.Book.find({_id: {$in: selectedIds}},
            {projection: {_id: 1, title: 1, price: 1, quantity: 1, image: 1}}).toArray() as any as ICartItem[]

        cartItems.forEach(cartItem => {
            cartItem.orderQuantity = cartSession.items[cartItem._id.toString()].orderQuantity
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
                        filter: {_id: new ObjectId(bookId) },
                        update: {$set: {quantity: quantity - orderQuantity}}
                    }
                }
        })

        await this.Book.bulkWrite(bulkOperations as any)
    }
}
