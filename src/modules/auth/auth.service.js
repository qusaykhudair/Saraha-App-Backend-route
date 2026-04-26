import { SYS_ROLE } from "../../common/constant/role.constant.js";
import { SYS_MESSAGE } from "../../common/constant/message.constant.js";
import { comparePassword, hash } from "../../common/utils/bycrypt.utils.js";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../../common/utils/error.utils.js";
import { checkUserExist, createUser } from "../user/user.service.js";
import { generateTokens } from "../../common/utils/jwt.utils.js";
import { otpRepository } from "../../DB/models/otp/otp.repsitory.js";
import { userRepository } from "../../DB/models/user/user.repository.js";
import { tokenRepository } from "../../DB/models/token/token.repository.js";
import { OAuth2Client } from "google-auth-library";
import { redisClient } from "../../DB/models/redis.connection.js";
import jwt from "jsonwebtoken";

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
      body.provider = "system";
      // Encrypt phone number if it exists
      if (body.phoneNumber) {
        body.phoneNumber = encryption(phoneNumber);
      }
      // send otp to user email for verification
await sendOtp(body);
      // create user
      const createdUser = await createUser(body);
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    });
await redisClient.set(email, JSON.stringify(body), { EX: 5 * 60 }); // Store user data in Redis (Caching) with a 5-minute expiration

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
    const { accessToken, refreshToken } = generateTokens({ sub: userExist._id , role: userExist.role , provider: userExist.provider });

await redisClient.set(`refreshToken:${userExist._id}`, refreshToken)
    return { accessToken, refreshToken };
}   

export const verifyAccount = async (body) => {

  const { email, otp } = body;
  // check if otp is valid
const otpDoc = await redisClient.get(`${email}:${otp}`); // string or null
// check if otp is expired
if (!otpDoc) {
  throw new BadRequestException("expired otp");
}
if (otpDoc.otp !== otp) {
 otpDoc.attempts += 1;
 await otpRepository.update({ _id: otpDoc._id }, { attempts: otpDoc.attempts });
 if (otpDoc.attempts >= 5) {
  await otpRepository.delete({ _id: otpDoc._id });
  throw new BadRequestException("otp expired due to too many attempts");
 }
  throw new BadRequestException("invalid otp");
}
// update user isEmailVarified to true
// await UserRepository.update({ email }, { isEmailVarified: true });
    // create user into database
let data = await redisClient.get(email);
await userRepository.create(JSON.parse(data));
await redisClient.del(email); // delete user data from Redis after creating the account
// delete otp after verification
await redisClient.del(`${email}:otp`);
return true;
}

export async function sendOtp(body){
  const { email } = body;
  // check OTP valid on database
  const otpDoc = await otpRepository.getOne({ email });
  const otpInRedis = await redisClient.get(`${email}:otp`);
  if(otpDoc || otpInRedis){
    throw new BadRequestException("otp already sent and still valid");
  }
 // create otp for user verification
      const otp = Math.floor(100000 + Math.random() * 900000);
      // save otp in database
      redisClient.set(`${email}:${otp}`, otp, { EX: 5 * 60 }); // Store OTP in Redis with a 5-minute expiration

      // await otpRepository.create({
      //   email: body.email,
      //   otp,
      //   expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      // }); // otp will expire after 5 minutes
      // send otp to user by email
      await sendEmail({
        to: email,
        subject: "Your OTP for Saraha App",
        html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
      });
}

export const logoutFromAllDevices = async (userId) => {
  // Invalidate all tokens for the user by changing a field in the database
  await userRepository.update({ _id: userId }, { crdentialUpdateAt: Date.now() });
  return true;
}

// Logout from current device by blacklisting the token
export const logout = async (tokenPayload, user) => {
  // await tokenRepository.create({
  //   token: tokenPayload.jti,
  //   userId: user._id,
  //   expiresAt: tokenPayload.exp * 1000,
  // });
  await redisClient.set(`token:${tokenPayload.jti}`, "true", { EX: tokenPayload.exp - Math.floor(Date.now() / 1000) }); // Blacklist token in Redis until it expires
};
 // This function should verify the Google token and return the user information
 async function verifyGoogleToken(googleToken) {
  // Implement the logic to verify the Google token using the Google API
const client = new OAuth2Client ("YOUR_GOOGLE_CLIENT_ID");
// Verify the token and get the user information
const ticket = await client.verifyIdToken({googleToken});
// Get the user information from the token payload
const payload = ticket.getPayload();
return payload;
}
// Google login  
export const loginWithGoogle = async (googleToken) => {
  // Verify the Google token and get user info
  const googleUser = await verifyGoogleToken(googleToken);
  if (googleUser.email_verified == false) {
    throw new BadRequestException("Invalid Google Account");
  }
  // Check if the user already exists in the database
  const user = await userRepository.getOne({ email: googleUser.email });  
  // If the user does not exist, create a new user account
  if (!user) {
    const newUser = await userRepository.create({
      email: googleUser.email,
      userName: googleUser.name,
      role: SYS_ROLE.user,
      isEmailVarified: true,
      provider: "google",
    }); 
    // Generate tokens for the new user
return generateTokens({ sub: newUser._id, role: newUser.role , provider: newUser.provider });
  }
  // If the user exists, generate tokens for the existing user
  return generateTokens({ sub: user._id, role: user.role , provider: user.provider });


}

export const refreshTokenService= async(authorization)=>{
  // check token valid
  const payload = jwt.verify(
    authorization,
    "djdjjdsjajajajajajquiuwququququ"
  ); // valid - expire
const cashedRefreshToken = await redisClient.get(`refreshToken : ${payload.sub}`)
if (cashedRefreshToken != authorization){
  await logoutFromAllDevices({_id:payload.sub})
  await redisClient.del(`refreshToken : ${payload.sub}`)
  throw new UnauthorizedException("you are not authorized")
}

  delete payload.iat ;
  delete payload.exp;
  const {accessToken , refreshToken}= generateTokens(payload);
  await redisClient.set(`refreshToken : ${payload.sub}` , refreshToken)
  return {refreshToken , accessToken}

}
