import crypto from "crypto";

const SALT_CONSTANT: crypto.BinaryLike = crypto.randomBytes(128).toString("base64");
const SALT_ITERATIONS: number = 310000;
const SALT_KEYLEN: number = 32;
const SALT_DIGEST: string = "sha256";
const port = 3000;

export { SALT_CONSTANT, SALT_ITERATIONS, SALT_KEYLEN, SALT_DIGEST, port };
