import { connect, Model, model } from "mongoose"
import { EBookState, IBook, ICategoryFull, ILanguage, IUser } from "./types"
import { bookSchema, categorySchema, languageSchema, userSchema } from "./models/db/schemas"

export const populateDb = async (database: string | undefined) => {
    if(!database) throw new Error("Database must be specified!")
    const connection = await connect(`mongodb://127.0.0.1:27017/${database}`)
    const User: Model<IUser> = model<IUser>("User", userSchema)
    const Language: Model<ILanguage> = model<ILanguage>("Language", languageSchema)
    const Category: Model<ICategoryFull> = model<ICategoryFull>("Category", categorySchema)
    const Book: Model<IBook> = model<IBook>("Book", bookSchema)

    if(process.env.TRUNCATE){
        await connection.connection.dropDatabase()
    }

    const languageIds = (await Language.insertMany([
        { name: "Polski" },
        { name: "Angielski" }
    ])).map(full => full._id)

    const categories: ICategoryFull[] = await Category.insertMany([
        {
            name: "Fikcja",
            subcategories: [
                { name: "Fantastyka" },
                { name: "Horror" },
                { name: "Kryminał" },
                { name: "Romans" }
            ]
        },
        {
            name: "Nauka",
            subcategories: [
                { name: "Matematyka" },
                { name: "Fizyka" },
                { name: "Biologia" }
            ]
        },
        {
            name: "Sztuka",
            subcategories: [
                { name: "Malarstwo" },
                { name: "Muzyka" },
                { name: "Rzeźba" }
            ]
        },
        {
            name: "Historia",
            subcategories: [
                { name: "Średniowiecze" },
                { name: "Nowożytność" },
                { name: "Wojny światowe" }
            ]
        },
        {
            name: "Podróże",
            subcategories: [
                { name: "Przewodniki" },
                { name: "Relacje z podróży" },
                { name: "Atlas świata" }
            ]
        }
    ]) as any as ICategoryFull[]

    await Book.insertMany([
        {
            title: "Lalka",
            author: "Bolesław Prus",
            description: "Historia miłosna i obraz społeczeństwa XIX wieku.",
            state: EBookState.GOOD,
            language: languageIds[0],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[3]._id],
            quantity: 5,
            price: 29.99,
        },
        {
            title: "W pustyni i w puszczy",
            author: "Henryk Sienkiewicz",
            description: "Opowieść o przygodach Stasia i Nel w Afryce.",
            state: EBookState.VGOOD,
            language: languageIds[0],
            category: categories[4]._id,
            subcategories: [categories[4].subcategories[1]._id],
            quantity: 10,
            price: 19.99,
        },
        {
            title: "Pan Tadeusz",
            author: "Adam Mickiewicz",
            description: "Epicka opowieść o życiu szlachty polskiej na Litwie.",
            state: EBookState.NEW,
            language: languageIds[0],
            category: categories[3]._id,
            subcategories: [categories[3].subcategories[0]._id],
            quantity: 7,
            price: 24.99,
        },
        {
            title: "Solaris",
            author: "Stanisław Lem",
            description: "Historia eksploracji tajemniczej planety Solaris.",
            state: EBookState.NEW,
            language: languageIds[1],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 15,
            price: 34.99,
        },
        {
            title: "Mistrz i Małgorzata",
            author: "Michaił Bułhakow",
            description: "Mistyczna opowieść o miłości i władzy.",
            state: EBookState.VGOOD,
            language: languageIds[1],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id, categories[0].subcategories[2]._id],
            quantity: 8,
            price: 39.99,
        },
        {
            title: "Podstawy matematyki",
            author: "Władysław Orlicz",
            description: "Wprowadzenie do podstaw matematyki dla studentów.",
            state: EBookState.GOOD,
            language: languageIds[0],
            category: categories[1]._id,
            subcategories: [categories[1].subcategories[0]._id],
            quantity: 12,
            price: 45.99,
        },
        {
            title: "Teoria względności",
            author: "Albert Einstein",
            description: "Wyjaśnienie teorii względności przez jej twórcę.",
            state: EBookState.NEW,
            language: languageIds[1],
            category: categories[1]._id,
            subcategories: [categories[1].subcategories[1]._id],
            quantity: 6,
            price: 49.99,
        },
        {
            title: "Atlas świata",
            author: "National Geographic",
            description: "Kompletny atlas świata z mapami i zdjęciami.",
            state: EBookState.VGOOD,
            language: languageIds[0],
            category: categories[4]._id,
            subcategories: [categories[4].subcategories[2]._id],
            quantity: 20,
            price: 79.99,
        },
        {
            title: "Historia sztuki",
            author: "Ernst Gombrich",
            description: "Przegląd historii sztuki od starożytności do współczesności.",
            state: EBookState.GOOD,
            language: languageIds[1],
            category: categories[2]._id,
            subcategories: [categories[2].subcategories[0]._id],
            quantity: 10,
            price: 59.99,
        },
        {
            title: "Przewodnik po Tatrach",
            author: "Jan Krzeptowski",
            description: "Praktyczny przewodnik po szlakach tatrzańskich.",
            state: EBookState.VGOOD,
            language: languageIds[0],
            category: categories[4]._id,
            subcategories: [categories[4].subcategories[0]._id],
            quantity: 8,
            price: 29.99,
        },
        {
            title: "Ostatnie Życzenie",
            author: "Andrzej Sapkowski",
            description: "Pierwsza część opowieści o Geralcie z Rivii.",
            state: EBookState.NEW,
            language: languageIds[0],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 39.99,
            tomeNumber: 1,
            tomeGroup: 1,
            image: "ostatnie_zyczenie.jpg",
        },
        {
            title: "Miecz Przeznaczenia",
            author: "Andrzej Sapkowski",
            description: "Kontynuacja przygód Geralta z Rivii.",
            state: EBookState.NEW,
            language: languageIds[0],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 39.99,
            tomeNumber: 2,
            tomeGroup: 1,
            image: "miecz_przeznaczenia.jpg",
        },
        {
            title: "Krew Elfów",
            author: "Andrzej Sapkowski",
            description: "Pierwsza pełnoprawna powieść w Sadze Wiedźmińskiej.",
            state: EBookState.NEW,
            language: languageIds[0],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 39.99,
            tomeNumber: 3,
            tomeGroup: 1,
            image: "krew_elfow.jpg",
        },
        {
            title: "Ogniem i Mieczem",
            author: "Henryk Sienkiewicz",
            description: "Pierwsza część Trylogii o walkach w XVII wieku.",
            state: EBookState.GOOD,
            language: languageIds[0],
            category: categories[3]._id,
            subcategories: [categories[3].subcategories[1]._id],
            quantity: 15,
            price: 44.99,
            tomeNumber: 1,
            tomeGroup: 2,
            image: "ogniem_i_mieczem.jpg",
        },
        {
            title: "Potop",
            author: "Henryk Sienkiewicz",
            description: "Kontynuacja Trylogii, opowieść o szwedzkim potopie.",
            state: EBookState.GOOD,
            language: languageIds[0],
            category: categories[3]._id,
            subcategories: [categories[3].subcategories[1]._id],
            quantity: 15,
            price: 44.99,
            tomeNumber: 2,
            tomeGroup: 2,
            image: "potop.jpg",
        },
        {
            title: "Pan Wołodyjowski",
            author: "Henryk Sienkiewicz",
            description: "Ostatnia część tryologii",
            state: EBookState.GOOD,
            language: languageIds[0],
            category: categories[3]._id,
            subcategories: [categories[3].subcategories[1]._id],
            quantity: 15,
            price: 44.99,
            tomeNumber: 2,
            tomeGroup: 2,
            image: "pan_wolodyjowski.jpg",
        },
        {
            title: "Kroniki Narnii: Lew, Czarownica i Stara Szafa",
            author: "C.S. Lewis",
            description: "Pierwsza część magicznych przygód w Narnii.",
            state: EBookState.VGOOD,
            language: languageIds[1],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 29.99,
            tomeNumber: 1,
            tomeGroup: 3,
        },
        {
            title: "Kroniki Narnii: Książę Kaspian",
            author: "C.S. Lewis",
            description: "Druga część magicznych przygód w Narnii.",
            state: EBookState.VGOOD,
            language: languageIds[1],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 29.99,
            tomeNumber: 2,
            tomeGroup: 3,
        },
        {
            title: "Kroniki Narnii: Podróż Wędrowca do Świtu",
            author: "C.S. Lewis",
            description: "Trzecia część magicznych przygód w Narnii.",
            state: EBookState.VGOOD,
            language: languageIds[1],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 29.99,
            tomeNumber: 3,
            tomeGroup: 3,
        },
        {
            title: "Kroniki Narnii: Srebrne Krzesło",
            author: "C.S. Lewis",
            description: "Czwarta część magicznych przygód w Narnii.",
            state: EBookState.VGOOD,
            language: languageIds[1],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 29.99,
            tomeNumber: 4,
            tomeGroup: 3,
        },
        {
            title: "Kroniki Narnii: Koń i jego chłopiec",
            author: "C.S. Lewis",
            description: "Piąta część magicznych przygód w Narnii.",
            state: EBookState.VGOOD,
            language: languageIds[1],
            category: categories[0]._id,
            subcategories: [categories[0].subcategories[0]._id],
            quantity: 10,
            price: 29.99,
            tomeNumber: 5,
            tomeGroup: 3,
        },
    ]);

    process.exit(0)
}
