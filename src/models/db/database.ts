import mysql from 'mysql2';
import { Pool, createPool } from "mysql2/promise"
import { Database, SQLDatabaseSettings } from "../../types";

export class SQLDatabase implements Database{
    private pool: Pool;

    constructor(data: SQLDatabaseSettings){
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
        const [rows] = await this.pool.query(query)
        return rows as unknown[]
    }

    format = (query: string, data: any[]): string => mysql.format(query, data)

    async formattedQuery(query: string, data: any[]): Promise<unknown[]>{
        return this.query(this.format(query, data))
    }
}
