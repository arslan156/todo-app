import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../services/api";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { addNotification } from "../tasks/notificationUtils";
import {
  AuthLayout,
  Field,
  FormMessage,
  apiErrorMessage,
  primaryButtonClass,
  textLinkClass,
} from "./AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter the email address you signed up with.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { data } = await authApi.post("/forgot-password", {
        email: email.trim(),
      });
      setSentMessage(data.message);
      addNotification({
        title: "Password reset email sent",
        message: data.message,
        type: "auth",
      });
    } catch (requestError) {
      const message = apiErrorMessage(
        requestError,
        "Unable to send the reset email."
      );
      setError(message);
      addNotification({
        title: "Unable to send reset email",
        message,
        type: "auth",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your account email and we'll send you a link to choose a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/signin" className={textLinkClass}>
            Back to sign in
          </Link>
        </>
      }
    >
      {sentMessage ? (
        <div className="mt-8 space-y-4">
          <FormMessage type="success">{sentMessage}</FormMessage>
          <p className="text-sm leading-6 text-[#7a756c]">
            The link works for 30 minutes. Check your spam folder if it
            doesn't arrive.
          </p>
          <button
            type="button"
            onClick={() => setSentMessage("")}
            className={`text-sm ${textLinkClass}`}
          >
            Send it again
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-8 space-y-4">
          <FormMessage>{error}</FormMessage>
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <LoadingSpinner />
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
