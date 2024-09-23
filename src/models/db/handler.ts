import { Database, BookProperty, Book, CategoryInfoFull, LoginUser, User, Cart, CartItem } from "../../types"
import bcrypt from 'bcrypt';

export class DatabaseHandler{
    private database: Database
    private static _categories: BookProperty[]
    private static _languages: BookProperty[]
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

    // Use DatabaseHandler.setup instead of normal constructor
    private constructor(database: Database){
        this.database = database
    }

    static async setup(database: Database): Promise<DatabaseHandler>{
        const handler = new DatabaseHandler(database);
        DatabaseHandler._categories = await handler.getCategories()
        DatabaseHandler._languages = await handler.getLanguages()
        return handler
    }

    async getUser(email: string): Promise<User>
    async getUser(id: number): Promise<User>
    async getUser(data: string | number): Promise<User>{
        switch(typeof data){
            case "string":
                return (await this.database.formattedQuery("SELECT email FROM users WHERE email = ?", [data]) as User[])[0]
            case "number":
                return (await this.database.formattedQuery("SELECT email FROM users WHERE id = ?", [data]) as User[])[0]
            default:
                throw new Error(`Wrong type provided to getUser function! Provided type: ${typeof data}`)
        }
    }

    async checkUserCredentials({email, plainPassword}: LoginUser): Promise<boolean>{
        try{
            const maybeUser = await this.database.formattedQuery("SELECT password FROM users WHERE email = ?", [email]) as {password: string}[]
            const savedPassword = maybeUser[0]?.password
            return await bcrypt.compare(plainPassword, savedPassword)
        }
        catch(error){
            // user not found
            return false
        }
    }

    async addUser({email, plainPassword}: LoginUser): Promise<number>{
        const hashed = await bcrypt.hash(plainPassword, 10)
        return (await this.database.formattedQuery("INSERT INTO users(email, password) VALUES(?, ?)", [email, hashed]) as any).insertId
    }

    async getCategories(): Promise<BookProperty[]>{
        return await this.database.query("SELECT id, name FROM categories") as BookProperty[]
    }

    async getLanguages(): Promise<BookProperty[]>{
        return await this.database.query("SELECT id, name FROM languages") as BookProperty[]
    }

    async getFullCategoryInfo(categoryId: number): Promise<CategoryInfoFull>{
        let category = (await this.database.formattedQuery("SELECT id, name FROM categories WHERE id = ? LIMIT 1", [categoryId] ))[0] as BookProperty
        let subcategories = await this.database.formattedQuery("SELECT id, name FROM subcategories WHERE category_id = ?", [categoryId]) as BookProperty[]
        return {
            id: category.id,
            name: category.name,
            subcategories
        }
    }

    async getRandomBooks(quantity: number): Promise<Book[]>{
        return (await this.database.formattedQuery(`
            SELECT
                b.id,
                b.title,
                b.author,
                b.description,
                b.state,
                c.name AS category,
                s.name AS subcategory,
                l.name AS language,
                b.price,
                b.tome,
                b.quantity
            FROM books b
            JOIN categories c ON b.category_id = c.id
            JOIN subcategories s ON b.subcategory_id = s.id
            JOIN languages l ON b.language_id = l.id
            ORDER BY RAND()
            LIMIT ?;`, [quantity])
        ) as Book[]
    }

    async getBooksWithConstraint(constraint: string){
        let whereClause = constraint.length ? `WHERE ${constraint}` : "";
        return (await this.database.query(`
            SELECT
                books.id,
                books.title,
                books.author,
                books.description,
                books.state,
                categories.name AS category,
                subcategories.name AS subcategory,
                languages.name AS language,
                books.price,
                books.tome,
                books.quantity
            FROM books
            JOIN categories ON books.category_id = categories.id
            JOIN subcategories ON books.subcategory_id = subcategories.id
            JOIN languages ON books.language_id = languages.id
            ${whereClause};`)
        ) as Book[]
    }

    async getBookById(id: number): Promise<Book> {
        return (await this.database.formattedQuery(`
            SELECT
                b.id,
                b.title,
                b.author,
                b.description,
                b.state,
                c.name AS category,
                s.name AS subcategory,
                l.name AS language,
                b.price,
                b.tome,
                b.quantity
            FROM books b
            JOIN categories c ON b.category_id = c.id
            JOIN subcategories s ON b.subcategory_id = s.id
            JOIN languages l ON b.language_id = l.id
            WHERE b.id = ?;`, [id])
        )[0] as Book
    }

    async getCartItems(cartSession: Cart | undefined): Promise<CartItem[]>{
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

    async updateBooksPostPurchase(cartSession: Cart | undefined){
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
