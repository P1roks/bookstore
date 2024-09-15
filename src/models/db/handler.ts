import { Database, CategoryInfo } from "../../types"

export class DatabaseHandler{
    private database: Database
    public static categories: CategoryInfo[]

    constructor(database: Database){
        this.database = database
    }

    static async initialize(database: Database): Promise<DatabaseHandler>{
        const handler = new DatabaseHandler(database);
        DatabaseHandler.categories = await handler.getCategories()
        return handler
    }

    async checkUserCredentials(email, plainPassword){

    }

    async addBook(book: Book){

    }

    async addUser(email, plainPassword){

    }

    async getCategories(): Promise<CategoryInfo[]>{
        return (await this.database.query("SELECT id, name FROM categories")) as CategoryInfo[]
    }

    async getRandomBooks(quantity: number){
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
        )
    }

    async searchBooks(){

    }
}
