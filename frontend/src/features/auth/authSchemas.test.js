import { loginSchema, registerSchema } from "./authSchemas";

describe("loginSchema", () => {
  test("requires an email-or-username and password", () => {
    expect(loginSchema.safeParse({ email: " ", password: "" }).success).toBe(
      false
    );
  });

  test("trims the email-or-username but does not impose email-only validation", () => {
    expect(
      loginSchema.parse({ email: "  todo-user  ", password: " pass " })
    ).toEqual({ email: "todo-user", password: " pass " });
  });

  test("preserves the remember-me value for the existing sign-in request", () => {
    expect(
      loginSchema.parse({
        email: "todo-user",
        password: "password",
        remember: false,
      })
    ).toEqual({
      email: "todo-user",
      password: "password",
      remember: false,
    });
  });
});

describe("registerSchema", () => {
  test("trims email and username and enforces the existing registration rules", () => {
    expect(
      registerSchema.parse({
        email: "  todo@example.com ",
        username: " todo-user ",
        password: "password",
      })
    ).toEqual({
      email: "todo@example.com",
      username: "todo-user",
      password: "password",
    });
  });

  test.each([
    ["invalid email", "not-an-email", "todo-user", "password"],
    ["invalid username", "todo@example.com", "x!", "password"],
    ["short password", "todo@example.com", "todo-user", "short"],
  ])("rejects %s", (_caseName, email, username, password) => {
    expect(
      registerSchema.safeParse({ email, username, password }).success
    ).toBe(false);
  });

  test("uses the existing required-field message for a blank password", () => {
    const result = registerSchema.safeParse({
      email: "todo@example.com",
      username: "todo-user",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please fill in all fields.");
    }
  });
});
