import jwt from "jsonwebtoken";
import { getProfile } from "../src/modules/user/user.service.js";
import { NotFoundException } from "../src/common/utils/error.utils.js";

export const isAuthenticated = async(req, res, next) => {
      // get data from req
    const {authorization} = req.headers;
    const payload = jwt.verify(authorization, "djdjjdsjajajajajajquiuwququququ",);
    // get profile service
      const user = await getProfile({ _id: payload.sub });
      if (!user) throw new NotFoundException("user not found");
      // add user to req object
      req.user = user;
next();
    }