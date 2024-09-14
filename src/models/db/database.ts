import { createPool } from "mysql2/promise"

export class Database{
    #pool

    constructor(data){
        const { host, port, user, password, database } = data;

        if(!database) throw new Error("database must be specified")
        if(!user) throw new Error("user must be specified")

        this.#pool = createPool({
            host,
            port,
            user,
            password,
            database,
            connectionLimit: 10,
            multipleStatements: true
        })
    }

    async query(query){
        const pool = await this.#pool.getConnection()

        let result
        try{
            result = await pool.query(query)
        }
        catch(error){
            console.error(error)
            return null
        }
        return result
    }
}


