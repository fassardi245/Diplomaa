import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// 1. Definimos un tipo para el objeto global para TypeScript
const globalForSanity = globalThis as unknown as {
  sanityClient: ReturnType<typeof createClient> | undefined;
};

// 2. Comprobamos si ya existe la instancia en global, si no, la creamos
export const client = globalForSanity.sanityClient ?? createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  stega: {
    studioUrl:
      process.env.NODE_ENV === "production"
        ? `https://${process.env.VERCEL_URL}/studio`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/studio`,
  },
});

// 3. Si no estamos en producción, guardamos la instancia en global
if (process.env.NODE_ENV !== "production") globalForSanity.sanityClient = client;