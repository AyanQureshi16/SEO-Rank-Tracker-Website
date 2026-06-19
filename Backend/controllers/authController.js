import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}


//Register User
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        //Hash password
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

        //Create new user
        const user =await User.create({
            name,
            email,
            password: hashedPassword
        })
        const token = generateToken(user._id);

        res.status(201).json({ success: true, token, user });

    } catch (error) {
        console.error("Register error:",error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }
        //Find user
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        //Check password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(existingUser._id);

        res.status(201).json({ success: true, token, user: existingUser });


    } catch (error) {
        console.error("Register error:",error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//Get current User
export const getUser = async (req, res) => {
    try {
           const user = await User.findById(req.userId).select("-password");        
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
    }
    res.json({ success: true, user });

    } catch (error) {
        console.error("Register error:",error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
