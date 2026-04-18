import { model, Schema } from "mongoose";
import { SYS_GENDER, SYS_ROLE } from "../../../common/constant/index.js";


const schema = new Schema(
  {
    userName: { type: String, required: true, minlength: 2, maxlength: 20 },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    gender: {
      type: Number,
      enum: Object.values(SYS_GENDER),
      default: SYS_GENDER.male,
    },
    role: {
      type: Number,
      enum: Object.values(SYS_ROLE),
      default: SYS_ROLE.user,
    },
    phoneNumber: {
      type: Number,
      required: function () {
        if (this.email) {
          return false;
        }
        return true;
      },
    },
    profilePic : String ,
    isEmailVarified : { type: Boolean, default: false },
  },
 
  {
    timestamps : true ,
    
  }
);
export const User = model("User", schema);
