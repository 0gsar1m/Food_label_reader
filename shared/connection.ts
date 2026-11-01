/** Accepts only origins; insecure HTTP is restricted to private development addresses. */
export function validateApiUrl(input: string): string {
  const url = new URL(input.trim());
  const octets = url.hostname.split('.').map(Number);
  const ipv4 =
    octets.length === 4 &&
    octets.every((part) => Number.isInteger(part) && part >= 0 && part <= 255);
  const privateIp =
    ipv4 &&
    (octets[0] === 10 ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 172 && octets[1] !== undefined && octets[1] >= 16 && octets[1] <= 31));
  const local = ['localhost', '127.0.0.1'].includes(url.hostname) || privateIp;
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    (url.protocol === 'http:' && !local) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new Error(
      'HTTPS sunucu adresi kullan. Yerel geliştirmede yerel IP ve HTTP kullanılabilir.',
    );
  }
  return url.origin;
}
