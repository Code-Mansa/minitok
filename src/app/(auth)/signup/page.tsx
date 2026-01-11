"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/";

  const { register, isRegistering, isRegisterError } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ username, email, password });
      router.push(redirectTo); // redirect to dashboard or intended page
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className='flex flex-col gap-8 items-center justify-center min-h-screen'>
      <p className='font-bold text-yellow-500 text-xl'>
        Zemo<sub>App</sub>{" "}
      </p>
      <Card className='w-96 p-8 shadow-none bg-transparent border-0 px-0'>
        <h1 className='text-2xl font-bold mb-6'>Sign Up</h1>

        {isRegisterError && (
          <p className='text-sm text-red-600'>
            Registration failed. Try again.
          </p>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className=''>
            <Label>Username</Label>
            <Input
              type='text'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='rounded-full focus:bg-transparent mt-1 focus:fill-amber-600'
              required
              autoComplete='new-username'
              name='signup-username'
            />
          </div>

          <div>
            <Label>Email</Label>

            <Input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='rounded-full focus:bg-transparent mt-1'
              required
              autoComplete='new-email'
              name='signup-email'
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
              autoComplete='new-password'
              name='signup-password'
            />
          </div>

          <Button
            type='submit'
            className='w-full rounded-full py-7 bg-linear-to-br from-yellow-700 to-yellow-600 text-white'
            disabled={isRegistering}>
            {isRegistering ? "signing in..." : "Sign Up"}
          </Button>

          <p className='text-sm text-center mt-8'>
            Already have an account?{" "}
            <Link
              href='/login'
              className='hover:underline font-semibold text-yellow-500'>
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
