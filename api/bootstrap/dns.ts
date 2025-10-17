import dns from 'dns';

// Prefer IPv4 results to avoid SMTP IPv6 connectivity issues on some hosts
try {
  // Node 18+: 'ipv4first' ensures A records are preferred over AAAA
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // ignore if not supported
}


