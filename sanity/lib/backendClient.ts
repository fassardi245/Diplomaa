import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// 1. Definimos una clave distinta en el global para este cliente
const globalForBackend = globalThis as unknown as {
  sanityBackendClient: ReturnType<typeof createClient> | undefined;
};

// 2. Lógica de Singleton: usar existente o crear nueva
export const backendClient = globalForBackend.sanityBackendClient ?? createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, 
  token: process.env.SANITY_API_TOKEN,
});

// 3. Guardar en global en desarrollo
if (process.env.NODE_ENV !== "production") globalForBackend.sanityBackendClient = backendClient;