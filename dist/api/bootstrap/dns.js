"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
// Prefer IPv4 results to avoid SMTP IPv6 connectivity issues on some hosts
try {
    // Node 18+: 'ipv4first' ensures A records are preferred over AAAA
    dns_1.default.setDefaultResultOrder('ipv4first');
}
catch {
    // ignore if not supported
}
