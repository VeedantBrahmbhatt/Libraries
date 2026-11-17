import type { Book, ModelKey, SampleManifest } from './types';

export interface Catalog {
  books: Book[];
  manifest: SampleManifest;
}

const root = `${import.meta.env.BASE_URL}data/`;
let catalogPromise: Promise<Catalog> | null = null;
const vectorPromises = new Map<ModelKey, Promise<Float32Array>>();

async function fetchChecked(name: string, expected: { sha256: string; bytes: number }): Promise<ArrayBuffer> {
  const response = await fetch(`${root}${name}`);
  if (!response.ok) throw new Error(`Could not load ${name} (${response.status}).`);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== expected.bytes) throw new Error(`${name} has an unexpected size.`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  if (actual !== expected.sha256) throw new Error(`${name} did not pass its integrity check.`);
  return bytes;
}

export function loadCatalog(): Promise<Catalog> {
  if (catalogPromise) return catalogPromise;
  catalogPromise = (async () => {
    const response = await fetch(`${root}manifest.json`);
    if (!response.ok) throw new Error('The demonstration catalog is unavailable.');
    const manifest = await response.json() as SampleManifest;
    if (manifest.schema !== 1 || manifest.vector_encoding !== 'float16-le-row-major' ||
        !manifest.files['catalog.json'] || !Number.isInteger(manifest.books) || manifest.books < 1) {
      throw new Error('The demonstration catalog format is not supported.');
    }
    const bytes = await fetchChecked('catalog.json', manifest.files['catalog.json']);
    const books = JSON.parse(new TextDecoder().decode(bytes)) as Book[];
    if (!Array.isArray(books) || books.length !== manifest.books ||
        books.some(book => !book.id || !book.title || !book.url?.startsWith('https://'))) {
      throw new Error('The demonstration catalog contains invalid book records.');
    }
    return { books, manifest };
  })().catch(error => { catalogPromise = null; throw error; });
  return catalogPromise;
}

function halfToFloat(bits: number): number {
  const sign = (bits & 0x8000) ? -1 : 1;
  const exponent = (bits >> 10) & 0x1f;
  const fraction = bits & 0x3ff;
  if (exponent === 0) return sign * 2 ** -14 * (fraction / 1024);
  if (exponent === 31) return fraction ? Number.NaN : sign * Number.POSITIVE_INFINITY;
  return sign * 2 ** (exponent - 15) * (1 + fraction / 1024);
}

export function decodeHalfVectors(bytes: ArrayBuffer): Float32Array {
  if (bytes.byteLength % 2 !== 0) throw new Error('Vector bytes are incomplete.');
  const view = new DataView(bytes);
  const result = new Float32Array(bytes.byteLength / 2);
  for (let index = 0; index < result.length; index += 1) {
    result[index] = halfToFloat(view.getUint16(index * 2, true));
  }
  return result;
}

export function loadVectors(model: ModelKey, catalog: Catalog): Promise<Float32Array> {
  const prior = vectorPromises.get(model);
  if (prior) return prior;
  const promise = (async () => {
    const file = `${model}.f16`;
    const expected = catalog.manifest.files[file];
    const dimensions = catalog.manifest.models[model]?.dimensions;
    if (!expected || !Number.isInteger(dimensions) || dimensions < 1 ||
        expected.bytes !== catalog.books.length * dimensions * 2) {
      throw new Error(`The ${model} vector file is not aligned with the book sample.`);
    }
    const result = decodeHalfVectors(await fetchChecked(file, expected));
    if (result.some(value => !Number.isFinite(value))) {
      throw new Error(`The ${model} vectors contain invalid values.`);
    }
    return result;
  })().catch(error => { vectorPromises.delete(model); throw error; });
  vectorPromises.set(model, promise);
  return promise;
}
