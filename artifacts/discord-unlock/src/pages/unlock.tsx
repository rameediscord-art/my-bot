import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useListGrants, getListGrantsQueryKey } from '@workspace/api-client-react';

const ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: "Authentication failed. Please try again.",
  token_exchange_failed: "Could not connect to Discord. Please try again.",
  user_fetch_failed: "Could not retrieve your Discord profile. Please try again.",
  role_grant_failed: "You need to join the Discord server first, then try again.",
  internal_error: "Something went wrong. Please try again.",
};

export default function UnlockPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { data: grants } = useListGrants({
    query: {
      queryKey: getListGrantsQueryKey(),
      refetchInterval: 10000, // refresh member count every 10s
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorKey = params.get('error');
    if (errorKey) {
      setErrorMsg(ERROR_MESSAGES[errorKey] || "An unexpected error occurred. Please try again.");
    }
  }, []);

  const activeMembers = grants?.length || 0;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6">
      
      <main className="max-w-md w-full relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 ease-out">
        
        {/* Gateway icon / graphic */}
        <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-white/5 flex items-center justify-center mb-8 shadow-2xl">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 text-center">
          Temporary Access
        </h1>
        
        <p className="text-muted-foreground text-center text-lg mb-10 font-light max-w-sm">
          You have completed the required steps. Claim your pass to enter the server.
        </p>

        {errorMsg && (
          <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-8 text-center" data-testid="text-error-message">
            {errorMsg}
          </div>
        )}

        <a 
          href="/api/auth/discord" 
          className="w-full relative group overflow-hidden rounded-xl"
          data-testid="link-discord-login"
        >
          <div className="absolute inset-0 bg-primary translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
          <div className="w-full bg-primary/10 border border-primary/20 backdrop-blur-md px-6 py-4 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:bg-transparent">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="text-primary group-hover:text-primary-foreground transition-colors duration-300">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="font-semibold text-lg text-primary group-hover:text-primary-foreground transition-colors duration-300 tracking-wide">
              Login with Discord
            </span>
          </div>
        </a>

        {activeMembers > 0 && (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground/80 animate-in fade-in duration-1000 delay-300">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-background shadow-sm" />
              <div className="w-5 h-5 rounded-full bg-primary/40 border border-background shadow-sm" />
              <div className="w-5 h-5 rounded-full bg-primary/60 border border-background shadow-sm" />
            </div>
            <span data-testid="text-active-members">
              {activeMembers} {activeMembers === 1 ? 'member' : 'members'} currently have access
            </span>
          </div>
        )}

      </main>

    </div>
  );
}
