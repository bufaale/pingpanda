export const siteConfig = {
  name: "PingPanda",
  description:
    "Beautiful status pages and uptime monitoring for your SaaS. Keep your users informed with real-time incident updates.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    parent: "https://piposlab.com",
    twitter: "https://twitter.com/piposlabs",
  },
} as const;
