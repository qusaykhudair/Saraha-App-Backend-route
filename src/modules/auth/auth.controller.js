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
const router = Router();



router.post("/signup",fileUpload().single("image"),isValid(signupSchema), async (req, res, next) => {
  const { email, phoneNumber } = req.body;
  await checkUserExist({
    $or: [
      { email: { $eq: email, $exist: true, $ne: null } },
      { phoneNumber: { $eq: phoneNumber, $exist: true, $ne: null } },
    ],
  })
    .then(async (user) => {
      if (user) {
        throw new ConflictException(SYS_MESSAGE.user.alreadyExist);
      }
      // prepare data for creating user
      req.body.role = SYS_ROLE.user;
      req.body.password = await hash(req.body.password);
      // Encrypt phone number if it exists
      if(req.body.phoneNumber){
        req.body.phoneNumber= encryption(phoneNumber);
      }
      const createUser = await createUser(req.body);
      return res
        .status(201)
        .json({ message: SYS_MESSAGE.user.created, data: createUser });
      // Proceed with signup logic
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    });
});
                  
router.post("/login",fileUpload().none(), isValid(loginSchema) , async (req, res, next) => {
 // get data from request body
  const { email } = req.body;
  
  // check user exist or not
  const userExist = await checkUserExist({
    email: { $eq: email, $exist: true, $ne: null },
  });
  if (!userExist) {
    throw new NotFoundException(SYS_MESSAGE.user.notFound);
  }

  // compare password
  const match = await comparePassword(req.body.password, userExist?.password||"DefaultPassword");
  if (!match) {
    throw new NotFoundException(SYS_MESSAGE.user.invalidPassword);
  }
  // remove password from response *** we cant use delete because its a bason file and delete will not work on it
userExist.password = undefined;
// generate token
const { accessToken, refreshToken } = generateTokens({ sub: userExist._id , role: userExist.role });
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

export default router;
