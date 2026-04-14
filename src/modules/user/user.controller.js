import { Router } from "express";
import { NotFoundException } from "../../common/utils/error.utils.js";
import { decryption } from "../../common/utils/encryption.utils.js";
import jwt from "jsonwebtoken";
import { isAuthenticated } from "../../../middlewares/auth.middleware.js";
const router = Router();
// get profile >> url = /user/3 >> method = GET
router.get("/", isAuthenticated, async (req, res, next) => {
  const {user} = req;

  // - decryption phone
  if (user.phoneNumber){
    user.phoneNumber = decryption(user.phoneNumber);
  }
  // send response
  return res
    .status(200)
    .json({ message: "done", success: true, data: { user } });
});
export default router;