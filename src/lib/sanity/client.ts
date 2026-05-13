import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'tn0j01pf',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-20',
});
