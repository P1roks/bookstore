import mysql from 'mysql2';
import { Pool, QueryResult, createPool } from "mysql2/promise"
import { Database, DatabaseConstructorData } from "../../types";

export class SQLDatabase implements Database{
    private pool: Pool;

    constructor(data: DatabaseConstructorData){
        const { host, port, user, password, database } = data;

        if(!database) throw new Error("database must be specified")
        if(!user) throw new Error("user must be specified")

        this.pool = createPool({
            host,
            port,
            user,
            password,
            database,
            connectionLimit: 10,
            multipleStatements: true
        })
    }

    async query(query: string): Promise<unknown[]>{

        try{
            const [rows] = await this.pool.query(query)
            return rows as unknown[]
        }
        catch(error){
            console.log(error)
            throw new Error("SQL Error")
        }
    }

    format = (query: string, data: any[]): string => mysql.format(query, data)
}
