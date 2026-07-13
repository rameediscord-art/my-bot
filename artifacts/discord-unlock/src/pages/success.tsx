import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function SuccessPage() {
  const [params, setParams] = useState({
    username: '',
    expiresAt: '',
    hours: ''
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setParams({
      username: searchParams.get('username') || 'Member',
      expiresAt: searchParams.get('expires_at') || '',
      hours: searchParams.get('hours') || '24',
    });
  }, []);

  let formattedDate = 'soon';
  if (params.expiresAt) {
    try {
      formattedDate = format(new Date(params.expiresAt), "MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      // fallback if date parsing fails
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6">
      
      <main className="max-w-md w-full relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(88,101,242,0.2)]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 text-center">
          Access Granted
        </h1>
        
        <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 w-full mb-8 text-center flex flex-col items-center gap-1">
          <p className="text-lg text-foreground font-medium mb-1" data-testid="text-welcome">
            Welcome, <span className="text-primary">{params.username}</span>.
          </p>
          <p className="text-muted-foreground text-sm">
            Your {params.hours}-hour pass is now active.
          </p>
          
          <div className="w-full h-px bg-white/5 my-4"></div>
          
          <div className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-1">
            Valid Until
          </div>
          <div className="text-sm font-mono text-foreground/80" data-testid="text-expiry">
            {formattedDate}
          </div>
        </div>

        <a 
          href="discord://" 
          className="w-full bg-white text-black font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-2 hover:bg-white/90 transition-colors duration-200"
          data-testid="link-return-discord"
        >
          You're in — go back to Discord
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>

        <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
          If the button above doesn't work, you can close this window and open the Discord app manually.
        </p>

      </main>

    </div>
  );
}
