export function track(event: string, data?: Record<string, string | number>) {
  if (localStorage.getItem('devMode') === 'true') return
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track(event, data)
  }
}
