import { Router } from "express";
import { decryption } from "../../common/utils/encryption.utils.js";
import { isAuthenticated } from "../../../middlewares/auth.middleware.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { fileValidation } from "../../../middlewares/file-validation.middleware.js";
import { uploadProfilePicture } from "./user.service.js";
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
// upload profile picture 
router.patch("/upload-profile-picture", isAuthenticated, fileUpload().single("image"),fileValidation, async (req, res, next) => {
const updatedUser = await uploadProfilePicture(req.user, req.file)
return res.status(200).json({ message: "Profile picture updated successfully", success: true, data: { user: updatedUser } });
})
export default router;