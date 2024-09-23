import { NextFunction, Request, Response } from "express";
import { db } from "..";

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    if(req.session.user){
        try{
            const user = await db.getUser(req.session.user.email)
            return next()
        }
        catch{}
    }

    return res.redirect("/auth")
}
