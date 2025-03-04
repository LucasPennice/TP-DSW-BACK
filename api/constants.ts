import { ZodIssue, ZodIssueCode } from "zod";

const SALT_CONSTANT: string =
    "npQqlZ9CcnY62i6V+I2fEM6H1E0c//MdAUyNSWtKQ5J/37Yfeh4kjlB3u1wwyWYL1sSF6Wnm6dM3r0E9TRI1wRQBaxJioI7biSMibp/j3vXf4snk+/ZAi+IOE3+wr27geSy4TIS39AeOq/fe0SPt26xXkMmO1N2HJOnGSH6pb+Y=";
const SALT_ITERATIONS: number = 310000;

const SALT_KEYLEN: number = 32;
const SALT_DIGEST: string = "sha256";
const port = 3000;

export const errorToZod = (input: string): ZodIssue[] => {
    return [{ message: input, fatal: true, code: ZodIssueCode.custom, path: [] }];
};
export { SALT_CONSTANT, SALT_DIGEST, SALT_ITERATIONS, SALT_KEYLEN, port };
