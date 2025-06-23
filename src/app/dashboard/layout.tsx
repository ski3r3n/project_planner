// import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer'; // Adjust the import path as necessary

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // const cookieStore = await cookies(); // Await cookies() to handle async behavior
  const supabase = await createClient(); // Create Supabase client with cookies

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <main>{children}</main>;
}
