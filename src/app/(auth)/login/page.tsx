"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/kibo-ui/spinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, loginError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push(redirectTo); // ✅ redirect to intended page
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className='min-h-screen bg-black text-white flex items-center flex-col gap-8 justify-center'>
      <p className='font-bold text-yellow-500 text-xl'>
        Zemo<sub>App</sub>{" "}
      </p>
      <Card className='w-96 p-8 shadow-none bg-transparent border-0 px-0'>
        <h1 className='text-2xl font-bold mb-2'>Welcome Back</h1>
        {loginError && (
          <div className='bg-red-100 text-red-600 p-3 rounded-lg text-sm'>
            {loginError}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className=''>
            <Label>Email</Label>

            <Input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='rounded-full focus:bg-transparent mt-1 focus:fill-amber-600'
              required
            />
          </div>

          <div>
            <Label>Password</Label>

            <Input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='rounded-full focus:bg-transparent mt-1'
              required
            />

            <Link href='/' className='text-sm flex justify-end mt-1'>
              Forget Password
            </Link>
          </div>

          <Button
            type='submit'
            className='w-full rounded-full py-7 bg-linear-to-br from-yellow-700 to-yellow-600 text-white'
            disabled={isLoggingIn}>
            {isLoggingIn ? <Spinner variant='ellipsis' /> : "Login"}
          </Button>

          <p className='text-sm text-center mt-8'>
            Don&apos;t have an account?{" "}
            <Link
              href='/signup'
              className='hover:underline font-semibold text-yellow-500'>
              Signup
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
