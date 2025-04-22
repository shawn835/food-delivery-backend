import bcrypt from "bcrypt";
import { createUser } from "../models/userModel.js";
import { parseReqBody } from "../utility/parseReqBody.js";
import { registerValidator } from "../validator/validateRegisterInputs.js";

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
      role: "user",
      createdAt: new Date(),
    };

    try {
      await createUser(user); // <-- insert into MongoDB
    } catch (error) {
      if (error.code === 11000) {
        // Handle unique constraint error
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "Email or phone number already in use" })
        );
      }

      throw error; // Handle other DB errors
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
