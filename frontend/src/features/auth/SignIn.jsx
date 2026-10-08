import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authActions } from "../../app/store";
import { apiErrorMessage } from "../../services/api";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { addNotification } from "../tasks/notificationUtils";
import useAuth from "./useAuth";
import { loginSchema } from "./authSchemas";
import {
  AuthLayout,
  Field,
  FormMessage,
  primaryButtonClass,
  textLinkClass,
} from "./AuthLayout";

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const notice =
    searchParams.get("expired") === "1"
      ? "Your session has ended. Please sign in again."
      : searchParams.get("reset") === "1"
      ? "Your password was changed. Sign in with the new one."
      : "";

  const submit = async (values) => {
    clearErrors("root.server");
    try {
      await signIn(values);
      addNotification({
        title: "Signed in",
        message: "Signed in successfully.",
        type: "auth",
      });
      dispatch(authActions.login());
      navigate("/todo");
    } catch (requestError) {
      const message = apiErrorMessage(requestError, "Sign in failed.");
      setError("root.server", {
        type: "server",
        message,
      });
      addNotification({
        title: "Sign in failed",
        message,
        type: "auth",
        variant: "error",
      });
    }
  };
  const errorMessage =
    errors.root?.server?.message ||
    errors.email?.message ||
    errors.password?.message;

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in to pick up right where you left off."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className={textLinkClass}>
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="mt-8 space-y-4">
        {!errorMessage && <FormMessage type="info">{notice}</FormMessage>}
        <FormMessage>{errorMessage}</FormMessage>

        <Field
          id="email"
          label="Email or Username"
          type="text"
          autoComplete="username"
          placeholder="Enter your email or username"
          {...register("email")}
        />

        <div className="relative">
          <Field
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
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

        <div className="flex items-center justify-between gap-3 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-[#2b2b2b]">
            <input
              type="checkbox"
              {...register("remember")}
              className="h-3.5 w-3.5 accent-[#141414]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className={textLinkClass}>
            Forgot Password
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoadingSpinner />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
