
export default function manifest() {
  return {
    id: "/",
    name: "Medpact Dashboard",
    short_name: "Medpact",
    description: "Medpact Doctor Recruitment Dashboard",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0f4c81",
    icons: [
      {
        src: "/medpact-app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/medpact-app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
