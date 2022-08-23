import User from '../models/UserModel.js';
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
   try {
       const refreshToken = req.cookies.refreshToken;
       console.log(refreshToken);
       if (!refreshToken) return res.sendStatus(401);

       const user = await User .findOne({
           where: {
               refresh_token: refreshToken
           }
       });

       if (!user) return res.sendStatus(403);
       console.log(user);
       jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
           if (err) return res.sendStatus(403);
           const accessToken = jwt.sign({ id: user.id, name: user.name, email: user.email },
               process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" }
           );
           res.json({ accessToken });
       });

   } catch (error) {
       console.log(error);
   }
}