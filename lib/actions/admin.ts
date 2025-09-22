import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies });
  const role = formData.get("role") as string | null;
  const userId = formData.get("userId") as string;

  if (!userId || !role) {
    return { error: "User ID and role are required." };
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({ role })
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