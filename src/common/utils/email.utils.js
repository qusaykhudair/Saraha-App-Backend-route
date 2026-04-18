import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransporter({
        service: "gmail",
        host : "smtp.gmail.com",
        port : 587,
        auth: {
            // put your email and password on gmail to send email from it 
            user: "qusaykh@gmail.com",
            pass: "test2026"
        }
    });

    // Define the email options
    const mailOptions = {
        from: "Saraha App <qusaykh@gmail.com>",
        to,
        subject,
        html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};