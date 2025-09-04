'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  session: {
    id: string;
    email: string;
  } | null;
}

export default function Header({ session }: HeaderProps) {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Polling App</h1>
      <nav>
        {!session ? (
          <>
            <Link href="/login" className="mr-4 hover:text-gray-300">Login</Link>
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
    </header>
  );
}