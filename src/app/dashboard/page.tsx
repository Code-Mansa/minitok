"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Page = () => {
  const { user, isLoading, logout } = useAuth();

  // Show loading skeleton on initial load
  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-muted rounded w-64' />
          <div className='h-32 bg-muted rounded' />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-16'>
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            You are securely logged in with inactivity protection.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <p className='text-sm text-muted-foreground'>User ID</p>
            <p className='font-mono text-sm'>{user?.id}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Email</p>
            <p className='font-medium'>{user?.email}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Username</p>
            <p className='font-medium'>{user?.username || "—"}</p>
          </div>

          <Button onClick={() => logout()} variant='destructive'>
            Logout
          </Button>

          <div className='pt-4 border-t'>
            <p className='text-xs text-muted-foreground'>
              You will be logged out after 30 minutes of inactivity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
