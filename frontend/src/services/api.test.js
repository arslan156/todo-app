import { apiErrorMessage } from "./api";

describe("apiErrorMessage", () => {
  test("uses the message returned by the API", () => {
    expect(
      apiErrorMessage(
        { response: { data: { message: "Account already exists." } } },
        "Registration failed."
      )
    ).toBe("Account already exists.");
  });

  test("uses the fallback for an HTTP response without a message", () => {
    expect(
      apiErrorMessage({ response: { status: 500, data: {} } }, "Sign in failed.")
    ).toBe("Sign in failed.");
  });

  test("preserves the existing message for connection failures", () => {
    expect(apiErrorMessage({}, "Sign in failed.")).toBe(
      "Unable to connect to the server. Make sure the backend is running."
    );
  });
});
