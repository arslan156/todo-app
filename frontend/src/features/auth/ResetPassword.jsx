import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authActions } from "../../app/store";
import { authApi } from "../../services/api";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { addNotification } from "../tasks/notificationUtils";
import { saveSession } from "./session";
import {
  AuthLayout,
  Field,
  FormMessage,
  apiErrorMessage,
  primaryButtonClass,
  textLinkClass,
} from "./AuthLayout";

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [inputs, setInputs] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const change = (event) => {
    const { name, value } = event.target;
    setInputs((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (inputs.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (inputs.password !== inputs.confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      // A successful reset also signs the user in.
      const { data } = await authApi.post("/reset-password", {
        token,
        password: inputs.password,
      });
      saveSession(data.user, { resetActivity: true });
      addNotification({
        title: "Password reset",
        message: "Your password was reset successfully.",
        type: "auth",
      });
      dispatch(authActions.login());
      navigate("/todo");
    } catch (requestError) {
      const message = apiErrorMessage(
        requestError,
        "Unable to reset your password."
      );
      setError(message);
      addNotification({
        title: "Unable to reset password",
        message,
        type: "auth",
        variant: "error",
      });
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Reset password"
        subtitle="This page needs the link from your reset email."
      >
        <Link
          to="/forgot-password"
          className={`mt-8 block text-center ${primaryButtonClass}`}
        >
          Request a Reset Link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Choose a new password for your account."
      footer={
        <>
          Link expired?{" "}
          <Link to="/forgot-password" className={textLinkClass}>
            Request a new one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        <FormMessage>{error}</FormMessage>

        <Field
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter a new password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={inputs.password}
          onChange={change}
        />

        <Field
          id="confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter it again"
          value={inputs.confirm}
          onChange={change}
        />

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoadingSpinner />
              Saving...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
