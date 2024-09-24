import { Express } from "express-serve-static-core";
import { SessionCart, User } from "./types";

declare module "express-session" {
    export interface SessionData {
        user: User,
        cart: SessionCart,
    }
}
