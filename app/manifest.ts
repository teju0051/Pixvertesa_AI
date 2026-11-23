import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pixvertesa   AI Image Detector by Znxios International",
    short_name: "Pixvertesa",
    description:
      "Check if an image is real or AI-generated with EXIF forensics and zero image retention.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/pixvertesa.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
