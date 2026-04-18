import { DBRepository } from "../db.repository.js";
import { Otp } from "./otp.model.js";

export class OtpRepository extends DBRepository {
    constructor(){
        super(Otp);
    }}

    export const otpRepository = new OtpRepository();