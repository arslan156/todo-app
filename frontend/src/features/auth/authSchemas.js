import { z } from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

const requiredCredentialsMessage =
  "Enter your email or username and your password.";
const requiredRegistrationMessage = "Please fill in all fields.";

export const loginSchema = z.object({
  email: z.string().trim().min(1, requiredCredentialsMessage),
  password: z.string().min(1, requiredCredentialsMessage),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, requiredRegistrationMessage)
    .regex(EMAIL_PATTERN, "Enter a valid email address."),
  username: z
    .string()
    .trim()
    .min(1, requiredRegistrationMessage)
    .regex(
      USERNAME_PATTERN,
      "Username must be 3-30 characters: letters, numbers, dots, dashes or underscores."
    ),
  password: z
    .string()
    .min(1, requiredRegistrationMessage)
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    ),
});
