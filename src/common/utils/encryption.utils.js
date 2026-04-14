import crypto from "node:crypto";
export function encryption(plainText) {
    const iv = crypto.randomBytes(16);
  const cipher =  crypto.createCipheriv("aes-256-cbc", Buffer.from("12345678123456781234567812345678"),iv
)

let encryptedData = cipher.update(plainText, "utf-8", "hex");
encryptedData += cipher.final("hex");
return `${iv.toString("hex")}:${encryptedData}`;
}

export function decryption(encrypted) {
    const [iv, encryptedData] = encrypted.split(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from("12345678123456781234567812345678"),
    Buffer.from(iv, "hex")
);
    let decrypted = decipher.update(encryptedData, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
}