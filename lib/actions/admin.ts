import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database, TablesUpdate } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies });
  const role = formData.get("role") as string | null;
  const userId = formData.get("userId") as string | null;

  if (!userId || !role) {
    return { error: "User ID and role are required." };
  }

  // 1. Assert the caller is authenticated and is an admin
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) {
    return { error: "Authentication required." };
  }

  const { data: callerProfileData, error: callerProfileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfileError || callerProfileData?.role !== "admin") {
    console.error("Admin privileges required:", callerProfileError);
    return { error: "Admin privileges required." };
  }

  // 3. Validate the requested role against an allowed list
  const allowedRoles = ["admin", "default"]; // Assuming 'default' is the non-admin role
  if (!allowedRoles.includes(role)) {
    return { error: "Invalid role specified." };
  }

  // 4. Verify the target user exists
  const { data: targetUser, error: targetUserError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (targetUserError || !targetUser) {
    console.error("Target user not found:", targetUserError);
    return { error: "Target user not found." };
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({ role: role } as Partial<Database['public']['Tables']['users']['Row']>)
      .eq("id", userId);

    if (error) {
      console.error("Error updating user role:", error);
      return { error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating user role:", error);
    return { error: "An unexpected error occurred." };
  }
}