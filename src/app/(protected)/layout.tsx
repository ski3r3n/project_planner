// app/(protected)/layout.tsx
// (The `(protected)` directory makes it a route group, which doesn't affect the URL path but helps organize)

import { getAuthenticatedAppForUser } from '@/serverApp';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    // If not authenticated, redirect to the login page
    redirect('/login');
  }

  // If authenticated, render the children (the protected pages)
  return (
    <div>
      <header>
        <h1>My Protected App</h1>
        <p>Welcome, {currentUser.displayName || currentUser.email}!</p>
        {/* Add navigation, logout button, etc. */}
      </header>
      <main>
        {children} {/* This is where your protected pages will render */}
      </main>
    </div>
  );
}
