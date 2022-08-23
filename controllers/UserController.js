import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ["id", "name", "email"],
        });
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
    }
}

export const register = async (req, res) => {
    const { name, email, password, password_confirmation } = req.body;
    if (password !== password_confirmation) {
        return res.status(400).json({
            message: "Password and password confirmation doesn't match"
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        await Users.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Successfully registered user"
        });
    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({
            where: {
                email
            }
        });

        if (!user) return res.status(400).json({ message: "These credentials do not match our records" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "These credentials do not match our records!"});

        const accessToken = jwt.sign({ id: user.id, name: user.name, email: user.email },
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" }
        );
        const refreshToken = jwt.sign({ id: user.id, name: user.name, email: user.email },
            process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" }
        );

        await Users.update({ refresh_token: refreshToken}, {
            where: {
                id: user.id
            }
        });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        res.status(200).json({
            message: "Successfully logged in",
            accessToken,
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.sendStatus(204);

        const user = await Users.findOne({
            where: {
                refresh_token: refreshToken
            }
        });
        console.log(user);
        if (!user) return res.sendStatus(204);

        await Users.update({ refresh_token: null}, {
            where: {
                id: user.id
            }
        });
        res.clearCookie('refreshToken');

        return res.sendStatus(200);
    } catch (error) {
        console.log(error.message);
    }
}