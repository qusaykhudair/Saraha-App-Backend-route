import jwt from "jsonwebtoken";
import { getProfile } from "../src/modules/user/user.service.js";
import { BadRequestException, NotFoundException } from "../src/common/utils/error.utils.js";
import { tokenRepository } from "../src/DB/models/token/token.repository.js";

export const isAuthenticated = async(req, res, next) => {
      // get data from req
    const {authorization} = req.headers;
    const payload = jwt.verify(authorization, "djdjjdsjajajajajajquiuwququququ",);
    // get profile service
      const user = await getProfile({ _id: payload.sub });
      if (!user) throw new NotFoundException("user not found");
      // add user to req object
      req.user = user;
      // check credential update at
      if(new Date(user.crdentialUpdateAt).getTime() > payload.iat * 1000){
      throw new BadRequestException("invalid Token , please login again");
      }
      // check if token is blacklisted
      const tokenExists = await tokenRepository.getOne({ token: payload.jti });
      if (tokenExists) {
        throw new BadRequestException("Token is blacklisted, please login again");
      }
      // check if token is removed (blacklisted) in Redis
      const tokenExist = await redisClient.get(`token:${payload.jti}`);
      if(tokenExist){
        throw new BadRequestException("Token is removed, please login again");
      }
      // inject user and payload to req object
      req.user = user;
      req.payload = payload;
next();
    }