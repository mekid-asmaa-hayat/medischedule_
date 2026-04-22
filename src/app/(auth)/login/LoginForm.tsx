"use client";
    import { useState } from "react";
    import { useRouter, useSearchParams } from "next/navigation";
    import Link from "next/link";
    import { signIn } from "next-auth/react";
    import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { loginSchema, type LoginInput } from "@/lib/validations/auth";
    import { Loader2, Eye, EyeOff } from "lucide-react";

    export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginInput) => {
        setServerError("");
        const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        });

        if (result?.error) {
        setServerError("Invalid email or password. Please try again.");
        return;
        }

        router.push(callbackUrl);
        router.refresh();
    };

    return (
        <Card className="shadow-lg">
        <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your MediSchedule account</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {serverError}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    {...register("password")}
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
                Create one
            </Link>
            </div>

            <div className="mt-6 rounded-md bg-muted p-3 text-xs space-y-1">
            <p className="font-semibold text-muted-foreground">Demo accounts:</p>
            <p>Admin: <code>admin@medischedule.com</code> / <code>Admin1234!</code></p>
            <p>Doctor: <code>james.wilson@medischedule.com</code> / <code>Doctor1234!</code></p>
            <p>Patient: <code>patient@medischedule.com</code> / <code>Patient1234!</code></p>
            <p>Staff: <code>staff@medischedule.com</code> / <code>Staff1234!</code></p>
            </div>
        </CardContent>
        </Card>
    );
    }