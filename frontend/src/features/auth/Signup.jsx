import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authActions } from "../../app/store";
import { apiErrorMessage } from "../../services/api";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { addNotification } from "../tasks/notificationUtils";
import useAuth from "./useAuth";
import { registerSchema } from "./authSchemas";
import {
  AuthLayout,
  Field,
  FormMessage,
  primaryButtonClass,
  textLinkClass,
} from "./AuthLayout";

const MIN_PASSWORD_LENGTH = 8;

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  const submit = async (values) => {
    clearErrors("root.server");
    try {
      // The server signs the new account in straight away.
      await signUp(values);
      addNotification({
        title: "Account created",
        message: "Your account was created successfully.",
        type: "auth",
      });
      dispatch(authActions.login());
      navigate("/todo");
    } catch (requestError) {
      const message = apiErrorMessage(
        requestError,
        "Unable to create your account."
      );
      setError("root.server", {
        type: "server",
        message,
      });
      addNotification({
        title: "Unable to create account",
        message,
        type: "auth",
        variant: "error",
      });
    }
  };
  const errorMessage =
    errors.root?.server?.message ||
    errors.email?.message ||
    errors.username?.message ||
    errors.password?.message;

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start organizing your work and daily tasks."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className={textLinkClass}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="mt-8 space-y-4">
        <FormMessage>{errorMessage}</FormMessage>

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          {...register("email")}
        />

        <Field
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          {...register("username")}
        />

        <div className="relative">
          <Field
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition text-xs font-semibold"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoadingSpinner />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-[#7a756c]">
        By creating an account, you agree to the Terms of Service and
        Privacy Policy.
      </p>
    </AuthLayout>
  );
};

export default Signup;
