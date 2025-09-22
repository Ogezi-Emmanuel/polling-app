'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface HeaderProps {
  session: {
    id: string;
    email: string;
  } | null;
}

export default function Header({ session }: HeaderProps) {
  return (
    <header className="bg-gray-800 text-white p-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <h1 className="text-xl font-bold">Polling App</h1>
      <nav className="hidden md:flex items-center space-x-4">
        {!session ? (
          <>
            <Link href="/login" className="hover:text-gray-300">Login</Link>
            <Link href="/signup" className="hover:text-gray-300">Sign Up</Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Navigation</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/create-poll">Create Poll</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/my-polls">My Polls</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col space-y-4 mt-8">
              {!session ? (
                <>
                  <Link href="/login" className="text-lg font-medium">Login</Link>
                  <Link href="/signup" className="text-lg font-medium">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-lg font-medium">Dashboard</Link>
                  <Link href="/create-poll" className="text-lg font-medium">Create Poll</Link>
                  <Link href="/my-polls" className="text-lg font-medium">My Polls</Link>
                  <Link href="/profile" className="text-lg font-medium">Profile</Link>
                  <LogoutButton />
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}