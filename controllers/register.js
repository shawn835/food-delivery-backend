import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  findUserByPhone,
} from "../models/userModel.js";
import { parseReqBody } from "../utility/utils.js";

export const registerUser = async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = await parseReqBody(req);

    const existingUserByEmail = await findUserByEmail(email);
    const existingByPhonenumber = await findUserByPhone(phoneNumber);

    if (existingUserByEmail || existingByPhonenumber) {
      res.writeHead(409, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "email or phone number in use" }));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      role: "user",
      createdAt: new Date(),
    };

    await createUser(user);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "User created successfully", owner: user })
    );
  } catch (err) {
    console.log("error registering user:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: err.message }));
  }
};
