import bcrypt from "bcrypt";
import { createUser } from "../../models/userModel.js";
import { parseReqBody } from "../../utility/parseReqBody.js";
import { registerValidator } from "../../validator/validateRegisterInputs.js";
import { readFile } from "fs/promises";

export const registerUser = async (req, res) => {
  try {
    const reqBody = await parseReqBody(req);

    const { isValid, errors, sanitizedData } = registerValidator(reqBody);
    if (!isValid) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: errors[0] }));
    }

    const { name, email, password, phone, address, city } = sanitizedData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hashedPassword,
      name,
      phone,
      address,
      city,
      createdAt: new Date(),
    };

    const data = await readFile(
      new URL("../../config/adminWhitelist.json", import.meta.url),
      "utf-8"
    );
    const adminEmails = JSON.parse(data);

    user.role = adminEmails.includes(email) ? "admin" : "customer";

    try {
      await createUser(user);
    } catch (error) {
      if (error.code === 11000) {
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "Email or phone number already in use" })
        );
      }
      throw error;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "User created successfully", owner: user })
    );
  } catch (err) {
    console.error("Error registering user:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
};
