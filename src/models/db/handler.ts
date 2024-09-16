import { format } from "mysql2";
import { Database, BookProperty, Book, CategoryWithSubcategories, CategoryInfoFull, BookState } from "../../types"

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

    public static readonly getCategoriesObject = () => JSON.parse(JSON.stringify(DatabaseHandler._categories))
    public static readonly getStatesObject = () => JSON.parse(JSON.stringify(DatabaseHandler._states))
    public static readonly getLanguagesObject = () => JSON.parse(JSON.stringify(DatabaseHandler._languages))

    constructor(database: Database){
        this.database = database
    }

    static async initialize(database: Database): Promise<DatabaseHandler>{
        const handler = new DatabaseHandler(database);
        DatabaseHandler._categories = await handler.getCategories()
        DatabaseHandler._languages = await handler.getLanguages()
        return handler
    }

    async checkUserCredentials(email, plainPassword){

    }

    async addBook(book: Book){

    }

    async addUser(email, plainPassword){

    }

    async getCategories(): Promise<BookProperty[]>{
        return await this.database.query("SELECT id, name FROM categories") as BookProperty[]
    }

    async getLanguages(): Promise<BookProperty[]>{
        return await this.database.query("SELECT id, name FROM languages") as BookProperty[]
    }

    async getFullCategoryInfo(categoryId: number): Promise<CategoryInfoFull>{
        let category = (await this.database.query(format("SELECT id, name FROM categories WHERE id = ? LIMIT 1", [categoryId] )))[0] as BookProperty
        let subcategories = await this.database.query(format("SELECT id, name FROM subcategories WHERE category_id = ?", [categoryId])) as BookProperty[]
        return {
            id: category.id,
            name: category.name,
            subcategories
        }
    }

    async getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]>{
        let results = await this.database.query(`SELECT c.id AS id, c.name AS name, GROUP_CONCAT(sc.name) AS subcategories
          FROM categories c
          LEFT JOIN subcategories sc ON c.id = sc.category_id
          GROUP BY c.id, c.name`)
        return results.map((res: any): CategoryWithSubcategories => 
            ({
               id: res.id,
               name: res.name,
               subcategories: res.subcategories ? res.subcategories.split(",") : []
            })
        )
    }

    async getRandomBooks(quantity: number): Promise<Book[]>{
        return (await this.database.query(`
            SELECT
                b.id,
                b.title,
                b.author,
                b.description,
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
            LIMIT ${quantity};`)
        ) as Book[]
    }

    async getBooksWithConstraint(constraint: string){
        return (await this.database.query(`
            SELECT
                books.id,
                books.title,
                books.author,
                books.description,
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
            WHERE ${constraint};`)
        ) as Book[]
    }

    async getBookById(): Promise<any> {

    }
}
