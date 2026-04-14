import { BadRequestException } from "../src/common/utils/error.utils.js";
export const isValid=(schema)=>
{
return (req ,res,next)=>{
    // apply validation
      const validationResult = schema.validate(req.body,{abortEarly: false});
     if(validationResult.error){
    throw new BadRequestException(validationResult.error.details.map((detail) => detail.message).join(", "));}
    next();
}}
