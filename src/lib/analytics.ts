export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  
  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  // FB Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, params);
  }
};
