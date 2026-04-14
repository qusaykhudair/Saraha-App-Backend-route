import { userRepository } from "../../DB/models/user/user.repository.js"

export const checkUserExist = async(filter)=>{
    return await userRepository.getOne(filter);
}

export const createUser = async(userData)=>{
    return await userRepository.create(userData);
}

export const getProfile = async(filter)=>{
    return await userRepository.getOne(filter);
}