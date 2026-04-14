import joi from "joi";
import { SYS_ROLE } from "../../common/constant/role.constant.js";
import { SYS_GENDER } from "../../common/constant/gender.constant.js";


export const signupSchema = joi.object({
  userName: joi.string().min(2).max(100).trim().required().messages({
    "string.base": "Username should be a string",
    "string.empty": "Username cannot be empty",
    "string.min": "Username should have at least 2 characters",
    "string.max": "Username should have at most 100 characters",
    "any.required": "Username is required",}),
  email: joi.string().email().required().messages({
    "string.base": "Email should be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be a valid email address",
  }),
  phoneNumber: joi.string().regex(/^(00210|01|\+201)[0125]{1}{0-9}{8}$/).required().messages({
    "string.base": "Phone number should be a string",
    "string.empty": "Phone number cannot be empty",
    "string.pattern.base": "Phone number must be a valid format",
  }),
  gender : joi.number().valid(...Object.values(SYS_GENDER)).default(0),
  role: joi.number().valid(...Object.values(SYS_ROLE)).default(0),
  password: joi.string().min(6).max(100).required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ 
).messages({
  "string.pattern.base": "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
  "string.base": "Password should be a string",
  "string.empty": "Password cannot be empty", }),
  rePassword:joi.string().valid(joi.ref('password')).required().messages({
    "any.only": "Re-entered password must match the password",
    "string.base": "Re-entered password should be a string",
    "string.empty": "Re-entered password cannot be empty",
  }),
}).or("email", "phoneNumber").required();

export const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.base": "Email should be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be a valid email address",
  }),
    password: joi.string().min(6).max(100).required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ 
).messages({
  "string.pattern.base": "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
  "string.base": "Password should be a string",
  "string.empty": "Password cannot be empty", })

})