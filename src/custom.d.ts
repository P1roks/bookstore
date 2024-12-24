import { Express } from "express-serve-static-core";
import { ISessionCart, User } from "./types";

declare module "express-session" {
    export interface SessionData {
        user: User,
        cart: ISessionCart,
    }
}
