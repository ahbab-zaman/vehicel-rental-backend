import dotenv from "dotenv";
import path from "path";
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.join(process.cwd(), envFile) });

const config = {
  connection_str: process.env.CONNECTION_STR,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV,
};

export default config;
