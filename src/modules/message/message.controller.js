import { Router } from "express";
import { getAllMessage, getSpecificMessage, sendMessage } from "./message.service.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { isAuthenticated } from "../../../middlewares/auth.middleware.js";
const router = Router();

// send message anymouns
router.post("/:receiverId/anoymouns", fileUpload().array("attachments",2) , (req, res , next) => {
const {content} = req.body;
const {receiverId} = req.params;
const {attachments} = req.files;
sendMessage(content, receiverId, attachments)
  .then(() => {
    res.json({ success: true, message: "Message sent successfully" });
  })
  .catch((err) => {
  res.status(err.cause || 500).json({ success: false, error: err.message });
  });
});

// send message public
router.post("/:receiverId/public", isAuthenticated ,fileUpload().array("attachments",2) , (req, res , next) => {
const {content} = req.body;
const {receiverId} = req.params;
const {attachments} = req.files;
sendMessage(content, receiverId, attachments , senderId)
  .then(() => {
    res.json({ success: true, message: "Message sent successfully" });
  })
  .catch((err) => {
  res.status(err.cause || 500).json({ success: false, error: err.message });
  });
});

// get specific message 
router.get("/:id",isAuthenticated,async(req , res , next)=>{
  const {id} = req.params;
 const message = await getSpecificMessage(id , req.user._id)
 return res.status(200).json({message:"done" , success:true , data:{message}})
})
// get all message 

router.get("/",isAuthenticated,async(req , res , next)=>{
 const messages = await getAllMessage(req.user._id)
 return res.status(200).json({message:"done" , success:true , data:{messages}})
})
export default router;