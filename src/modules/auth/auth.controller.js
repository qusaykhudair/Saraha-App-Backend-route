import { Router } from "express";
import { checkUserExist } from "../user/user.service.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/utils/error.utils.js";
import { SYS_MESSAGE } from "../../common/constant/message.constant.js";
import { comparePassword } from "../../common/utils/bycrypt.utils.js";
import jwt from "jsonwebtoken";
import { generateTokens } from "../../common/utils/jwt.utils.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { isValid } from "../../../middlewares/validation.middleware.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { login, singup, verifyAccount } from "./auth.service.js";
const router = Router();



router.post("/signup",fileUpload().single("image"),isValid(signupSchema), async (req, res, next) => {
const createdUser = await singup(req.body);
      return res
        .status(201)
        .json({ message: SYS_MESSAGE.user.created, data: createdUser });
      // Proceed with signup logic
    })
                  
router.post("/login",fileUpload().none(), isValid(loginSchema) , async (req, res, next) => {

  const { accessToken, refreshToken } = await login(req.body);
  // send response
  return res.status(200).json({ message: "Login successful", data: { accessToken, refreshToken } });
});

router.get("/refresh-token", async (req, res, next) => {
// req.headers
const { authorization } = req.headers; // refresh
// check token valid
const payload = jwt.verify(
  authorization,
  "djdjjdsjajajajajajquiuwququququ"
); // valid - expire
console.log({ payloadFromRefresh: payload });
const { accessToken, refreshToken } = generateTokens(payload);


  // send response
  return res.status(200).json({ message: "Token refreshed successfully", data: { accessToken, refreshToken } });

});

router.patch("/verify-account", async (req, res, next) => {
await verifyAccount(req.body).then(() => {
  return res.status(200).json({ message: "Account verified successfully" });
})
.catch((error) => {
  return res
    .status(400)
    .json({ message: "Account verification failed", error: error.message });
});
})
export default router;
