import { createTransport } from "nodemailer";
import { config } from "dotenv";
config();

const hasCredentials = Boolean(process.env.EMAIL && process.env.PASSWORD);

const transpoter = hasCredentials
  ? createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      connectionTimeout: 5000, // 5s connection timeout
      greetingTimeout: 5000,
      socketTimeout: 5000,
    })
  : {
      verify: async () => {
        console.log("Nodemailer: EMAIL or PASSWORD not set. Mail notifications disabled.");
      },
      sendMail: async (options) => {
        console.log("Nodemailer simulation (Credentials missing). Message to:", options.to);
        return { messageId: "simulated" };
      },
    };

export default transpoter;