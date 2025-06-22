// src/components/withAuth.tsx (Corrected again!)

import React, { useEffect } from 'react';
import { useRouter } from 'next/router'; // For Pages Router navigation
import { auth } from '@/firebase';

// Make withAuth generic over the WrappedComponent's props 'P'
const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          console.log('User not authenticated on client-side, redirecting to /login');
          router.replace('/login');
        } else {
          console.log('Client-side auth state changed: User is', user.uid);
        }
      });

      return () => unsubscribe();
    }, [router]);

    // Render a loading state until the authentication status is determined
    if (!auth.currentUser) {
        return <div>Loading authentication...</div>;
    }

    // Pass all original props to the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Give the HOC a display name for easier debugging in React DevTools
  // Now, getDisplayName is also generic, so it correctly accepts WrappedComponent<P>
  Wrapper.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return Wrapper;
};

// Helper function to get the display name of a component for debugging
// Make this function generic over its own component's props 'T'
function getDisplayName<T extends object>(WrappedComponent: React.ComponentType<T>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;
