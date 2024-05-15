import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`;
  }
  return `http://localhost:3000${path}`;
}

export function constructMetadata({
  title = "Documentor - the SaaS for students",
  description = "Ask our AI-powered chat, ready to provide insights and answer questions about your documents. From uploading to exporting, DocuMentor makes your document workflow smarter, faster, and more efficient. Streamline your document handling with precision and ease—welcome to a smarter way to work.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    icons,
    metadataBase: new URL(absoluteUrl("/")),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
