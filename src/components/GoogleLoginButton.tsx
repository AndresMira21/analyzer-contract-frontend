import { useEffect, useRef } from 'react';

type Props = {
  handleGoogleLogin: (token: string) => void;
};

export function GoogleLoginButton({ handleGoogleLogin }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      console.error('Google Client ID no está definido');
      return;
    }
    const init = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !containerRef.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const token = String(response?.credential || '');
          if (token) handleGoogleLogin(token);
        },
      });
      google.accounts.id.renderButton(containerRef.current, { theme: 'outline', size: 'large' });
    };
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      init();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = init;
    document.head.appendChild(s);
  }, [handleGoogleLogin]);

  return <div ref={containerRef} />;
}