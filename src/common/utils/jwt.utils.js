import jwt from "jsonwebtoken";

export function generateTokens(payload){
const accessToken = jwt.sign(payload, "djdjjdsjajajajajajquiuwququququ", {
  expiresIn: 60,
});
const refreshToken = jwt.sign(payload, "djdjjdsjajajajajajquiuwququququ", {
  expiresIn: 60,
});

return { accessToken, refreshToken };
}