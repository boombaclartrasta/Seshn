export default function manifest() {
  return {
    name: "SESHN",
    short_name: "SESHN",
    description: "Track study sessions, focus, streaks, and share progress.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#101010",
    theme_color: "#101010",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
