import React from 'react';
import { supabaseServerReadOnly } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomUser } from '@/lib/supabase';
import { updateUserRole } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default async function AdminPage() {
  const supabase = await supabaseServerReadOnly();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user as CustomUser).role !== 'admin') {
    redirect('/login'); // Redirect non-admin users
  }

  const { data: users, error } = await supabase.from('users').select('id, email, role');

  if (error) {
    console.error('Error fetching users:', error);
    return <p>Error loading users.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <p>This is where admin-specific functionalities will be managed.</p>
      <h2 className="text-2xl font-bold mt-8 mb-4">Manage Users</h2>
      <ul>
        {users.map((u: any) => (
          <li key={u.id} className="flex justify-between items-center py-2 border-b">
            <span>{u.email}</span>
            <form action={async (formData) => {
              'use server';
              const newRole = formData.get('role') as string;
              await updateUserRole(formData);
            }} className="flex items-center space-x-2">
              <Select name="role" defaultValue={u.role || 'default'}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Update Role</Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}