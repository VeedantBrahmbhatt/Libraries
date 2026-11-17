/// <reference lib="webworker" />

import { env, pipeline } from '@huggingface/transformers';
import { MODELS } from './model-config';
import type { ModelKey } from './types';

env.allowLocalModels = false;
env.useBrowserCache = true;
if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1;

type Extractor = (text: string, options: { pooling: 'mean' | 'cls'; normalize: boolean }) =>
  Promise<{ data: Float32Array; dims: number[] }>;

let activeKey: ModelKey | null = null;
let activeExtractor: (Extractor & { dispose?: () => Promise<void> }) | null = null;

interface EncodeRequest {
  id: number;
  model: ModelKey;
  text: string;
}

self.addEventListener('message', async (event: MessageEvent<EncodeRequest>) => {
  const { id, model, text } = event.data;
  if (!Object.hasOwn(MODELS, model) || !text?.trim()) {
    self.postMessage({ type: 'error', id, message: 'A model and question are required.' });
    return;
  }
  const config = MODELS[model];
  try {
    if (activeKey !== model || !activeExtractor) {
      if (activeExtractor?.dispose) await activeExtractor.dispose();
      activeExtractor = null;
      activeKey = null;
      self.postMessage({ type: 'progress', id, message: `Loading ${config.label}…` });
      let downloadNoticeSent = false;
      const loaded = await pipeline('feature-extraction', config.repo, {
        revision: config.revision,
        dtype: 'q8',
        progress_callback: (progress) => {
          if (progress.status === 'progress' && !downloadNoticeSent) {
            downloadNoticeSent = true;
            self.postMessage({
              type: 'progress', id,
              message: `Downloading ${config.label} model files. This may take several minutes on first use.`,
            });
          }
        },
      });
      activeExtractor = loaded as unknown as typeof activeExtractor;
      activeKey = model;
    }
    self.postMessage({ type: 'progress', id, message: 'Understanding your question…' });
    const result = await activeExtractor!(config.queryPrefix + text, {
      pooling: config.pooling, normalize: true,
    });
    const vector = new Float32Array(result.data);
    if (vector.length !== config.dimensions || vector.some(value => !Number.isFinite(value))) {
      throw new Error('The model returned an invalid query vector.');
    }
    self.postMessage({ type: 'embedding', id, vector }, [vector.buffer]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The selected model could not be loaded.';
    self.postMessage({ type: 'error', id, message });
  }
});
