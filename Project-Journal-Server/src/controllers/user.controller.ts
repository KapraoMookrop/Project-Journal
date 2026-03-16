import { type NextFunction, type Request, type Response } from "express";
import * as userService from "../services/user.service.js";

export async function SignUp(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.SignUp(req.body);
    res.json(users);
  } catch (error) {
    console.error("Error in SignUp controller:", error);
    next(error);
  }
}

export async function Login(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await userService.Login(req.body);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in Login controller:", error);
    next(error);
  }
}

export async function CheckAlreadyExistsEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.query.email as string;
    const exists = await userService.CheckAlreadyExistsEmail(email);
    res.json({ exists });
  } catch (error) {
    console.error("Error in CheckAlreadyExistsEmail controller:", error);
    next(error);
  }
}
