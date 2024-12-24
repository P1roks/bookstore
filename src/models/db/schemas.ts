import { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import { BookState, IBook, ICategory, ILanguage, IUser } from "../../types";

export const userSchema = new Schema<IUser>({
    password: {type: String, required: true},
    email: {
        type: String,
        required: true,
        trim: true,
        match: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    }
})

userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
    next();
})

const subcategorySchema = new Schema({
    name: {type: String, required: true}
})

export const categorySchema = new Schema<ICategory>({
    name: {type: String, required: true},
    subcategories: [subcategorySchema]
})

export const languageSchema = new Schema<ILanguage>({
    name: {type: String, required: true}
})

export const bookSchema = new Schema<IBook>({
    title: {type: String, required: true},
    author: {type: String, required: true},
    description: {type: String, required: true},
    state: {type: String, enum: BookState},
    language: {
        type: Schema.Types.ObjectId,
        ref: "Language",
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
    tome_info: {
        tome_number: {type: Number, required: true},
        tome_group: {type: Number, required: true},
        required: false
    }
})
