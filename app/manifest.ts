import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hair & Co — Newport, Sydney",
    short_name: "Hair & Co",
    description:
      "A considered hair salon in Newport on Sydney's Northern Beaches. Cuts, colour, treatments and styling.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/brand/hair-and-co-mark-128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/brand/hair-and-co-mark-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/hair-and-co-mark.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
