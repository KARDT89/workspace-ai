"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { GithubLogoIcon } from "@phosphor-icons/react"
import { authClient } from "@/lib/betterauth/auth-client"

type LoginValues = {
  email: string
  password: string
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
    </svg>
  )
}

function FloatingInput({
  id,
  type,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string }) {
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder=" "
          className="peer block w-full rounded-lg px-3.5 pb-2.5 pt-5 text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.09)",
            color: "#f0f0f0",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.09)"
            e.currentTarget.style.boxShadow = "none"
          }}
          {...props}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3.5 text-sm transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[10px]"
          style={{ top: "0.875rem", color: "rgba(255,255,255,0.35)" }}
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: "rgba(239,68,68,0.9)" }}>{error}</p>}
    </div>
  )
}

export function LoginForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>()

  const credentialMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const { error } = await authClient.signIn.email(values)
      if (error) throw new Error(error.message ?? "Unable to sign in.")
    },
    onSuccess: () => {
      router.push("/mail")
      router.refresh()
    },
  })

  const socialMutation = useMutation({
    mutationFn: async (provider: "github" | "google") => {
      const { error } = await authClient.signIn.social({ provider, callbackURL: "/mail" })
      if (error) throw new Error(error.message ?? "Unable to sign in.")
    },
  })

  const mutationError = credentialMutation.error ?? socialMutation.error
  const isPending = credentialMutation.isPending || socialMutation.isPending

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {mutationError && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(252,165,165,0.9)" }}
        >
          {mutationError.message}
        </div>
      )}

      {/* Google */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => socialMutation.mutate("google")}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)" }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)" }}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* GitHub */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => socialMutation.mutate("github")}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)" }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}
      >
        <GithubLogoIcon size={16} />
        Continue with GitHub
      </button>

      {/* Separator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>or continue with email</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Email + Password form */}
      <form onSubmit={handleSubmit((v) => credentialMutation.mutate(v))} className="space-y-3">
        <FloatingInput
          id="email"
          type="email"
          label="Email"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required.",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
          })}
        />

        <div>
          <FloatingInput
            id="password"
            type="password"
            label="Password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required." })}
          />
          <div className="mt-1.5 text-right">
            <a href="#" className="text-xs transition-colors hover:text-foreground" style={{ color: "rgba(255,255,255,0.3)" }}>
              Forgot password?
            </a>
          </div>
        </div>

        {/* Shimmer submit */}
        <button
          type="submit"
          disabled={isPending}
          className="relative w-full overflow-hidden rounded-lg py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          style={{ background: "#2563eb" }}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <path d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Signing in…
            </span>
          ) : (
            <>
              <span className="relative z-10">Sign in</span>
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                  animation: "shimmer-sweep 2.5s linear infinite",
                }}
              />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
