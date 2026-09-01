import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

// El modo `multilingual` por defecto indexa es y en por separado.
export const { GET } = createFromSource(source);
