// src/utils/analytics.ts
export const trackEvent = (event: string, properties?: any) => {
  // Implement logic to track events using your preferred analytics service
  // Example using Google Analytics:
  // window.gtag("event", event, properties);
};

export const trackPageView = (url: string) => {
  // Implement logic to track page views using your preferred analytics service
  // Example using Google Analytics:
  // window.gtag("config", "GA_TRACKING_ID", { page_path: url });
};
