import { Database, searchParams } from "../../types"

export class DatabaseHandler{
    private database: Database

    constructor(database: Database){
        this.database = database
    }

    async checkUserCredentials(email, plainPassword){

    }

    async addBook(book: Book){

    }

    async addUser(email, plainPassword){

    }

    async getRandomBooks(quantity: number){

    }

    async searchBooks(params: searchParams){

    }
}
