import nodemailer from "nodemailer";
import { errorHandler } from "./errorHandler.js";

export const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASSS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject,
      text,
    });
    console.log("email sent");
  } catch (error) {
    return errorHandler(400, "Something happened");
  }
};
