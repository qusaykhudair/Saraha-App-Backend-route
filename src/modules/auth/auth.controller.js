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
import { login, loginWithGoogle, logout, logoutFromAllDevices, refreshTokenService, sendOtp, singup, verifyAccount } from "./auth.service.js";
import { isAuthenticated } from "../../../middlewares/auth.middleware.js";
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
    const { authorization } = req.headers; // refresh

 const {accessToken , refreshToken} = await refreshTokenService(authorization)
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

router.post("/send-otp", async (req, res, next) => {
await sendOtp(req.body).then(() => {
  return res.status(200).json({ message: "OTP sent successfully" })}).catch((error) => {
    return res
      .status(400)
      .json({ message: "Failed to send OTP", error: error.message });
  })})

  router.patch("/logout-all-devices", isAuthenticated, async (req, res, next) => {
  await logoutFromAllDevices(req.user);
  return res.status(200).json({ message: "Logged out from all devices successfully" }); 
  })

    router.post("/logout", isAuthenticated, async (req, res, next) => {
  await logout(req.user , req.payload);
  return res.status(200).json({ message: "Logged out successfully" }); 
  })

  router.post("login-with-google", async (req, res, next) => {
    const { googleToken } = req.body;
    // Implement Google login logic here
   const {accessToken , refreshToken } = await loginWithGoogle(googleToken);
    return res.status(200).json({ message: "Google login successful", data: { accessToken, refreshToken } });
  });
export default router;
