import { SYS_ROLE } from "../../common/constant/role.constant.js";
import { SYS_MESSAGE } from "../../common/constant/message.constant.js";
import { comparePassword, hash } from "../../common/utils/bycrypt.utils.js";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/utils/error.utils.js";
import { checkUserExist, createUser } from "../user/user.service.js";
import { generateTokens } from "../../common/utils/jwt.utils.js";
import { otpRepository } from "../../DB/models/otp/otp.repsitory.js";

export const singup = async (body) => {
  const { email, phoneNumber } = body;
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
      body.role = SYS_ROLE.user;
      body.password = await hash(body.password);
      // Encrypt phone number if it exists
      if (body.phoneNumber) {
        body.phoneNumber = encryption(phoneNumber);
      }
      // create otp for user verification
      const otp = Math.floor(100000 + Math.random() * 900000);
      // save otp in database
      await otpRepository.create({
        email: body.email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }); // otp will expire after 5 minutes
      // send otp to user by email
      await sendEmail({
        to: email,
        subject: "Your OTP for Saraha App",
        html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
      });
      // create user
      const createdUser = await createUser(body);
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    });
};

export const login = async (body) => {
     // get data from request body
      const { email } = body;
      
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
return { accessToken, refreshToken };
}   

export const verifyAccount = async (body) => {

  const { email, otp } = body;
  // check if otp is valid
const otpDoc = await otpRepository.getOne({email});
// check if otp is expired
if (!otpDoc) {
  throw new BadRequestException("expired otp");
}
if (otpDoc.otp !== otp) {
  throw new BadRequestException("invalid otp");
}
// update user isEmailVarified to true
await UserRepository.update({ email }, { isEmailVarified: true });
// delete otp after verification
await otpRepository.delete({ _id: otpDoc._id });
return true;
}