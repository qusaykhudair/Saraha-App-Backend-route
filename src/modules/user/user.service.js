import { SYS_MESSAGE } from "../../common/constant/message.constant.js";
import { NotFoundException } from "../../common/utils/error.utils.js";
import { userRepository } from "../../DB/models/user/user.repository.js"
import fs from "node:fs";

export const checkUserExist = async(filter)=>{
    return await userRepository.getOne(filter);
}

export const createUser = async(userData)=>{
    return await userRepository.create(userData);
}

export const getProfile = async(filter)=>{
    return await userRepository.getOne(filter);
}

export const uploadProfilePicture = async(user, file)=>{
    const updatedUser = await userRepository.update({_id: user._id}, {profilePicture: file.path});
    if (!updatedUser) {
        throw new NotFoundException(SYS_MESSAGE.user.notFound);
      }
      // delete old profile picture if exist
if(fs.existsSync(user.profilePicture)){ 
      fs.unlinkSync(user.profilePicture);
    }
    return updatedUser;
}