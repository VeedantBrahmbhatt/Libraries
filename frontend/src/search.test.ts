import { describe, expect, it } from 'vitest';
import { buildSearchIndex, rankBooks, rankKeywordBooks, tokens } from './search';
import type { Book } from './types';

function book(id: string, title: string, description: string): Book {
  return { id, title, description, authors: [], subjects: [], languages: ['en'], year: 2024,
    url: `https://example.org/${id}` };
}

describe('browser ranking', () => {
  it('keeps useful words from natural-language queries', () => {
    expect(tokens('I want a beginner book about AI for business')).toEqual(['beginner', 'ai', 'business']);
  });

  it('combines semantic and keyword ranks while preserving source alignment', () => {
    const books = [book('a', 'Ocean science', 'marine biology'),
      book('b', 'AI for business', 'A guide for managers'),
      book('c', 'Machine learning', 'Technical algorithms')];
    const index = buildSearchIndex(books);
    const vectors = new Float32Array([1, 0, 0, 1, 0.8, 0.2]);
    const query = new Float32Array([0, 1]);
    const meaning = rankBooks('AI for business', query, vectors, index, 'semantic');
    const hybrid = rankBooks('AI for business', query, vectors, index, 'hybrid');
    expect(meaning[0].book.id).toBe('b');
    expect(hybrid[0].book.id).toBe('b');
    expect(hybrid[0].relevance).toBeCloseTo(2 / 61);
    expect(hybrid.every(hit => Number.isFinite(hit.relevance))).toBe(true);
  });

  it('shows only one copy of a repeated title and rejects mismatched vectors', () => {
    const books = [book('a', 'Repeated title', ''), book('b', 'Repeated title', ''),
      book('c', 'Different title', '')];
    const index = buildSearchIndex(books);
    const hits = rankBooks('repeated title', new Float32Array([1, 0]),
      new Float32Array([1, 0, 0.9, 0.1, 0, 1]), index, 'semantic');
    expect(hits.map(hit => hit.book.id)).toEqual(['a', 'c']);
    expect(() => rankBooks('query', new Float32Array([1]), new Float32Array(2), index,
      'semantic')).toThrow('different dimensions');
  });

  it('offers a clearly separate keyword preview when a model cannot load', () => {
    const index = buildSearchIndex([book('a', 'Ocean science', 'marine biology'),
      book('b', 'AI for business', 'A guide for managers')]);
    expect(rankKeywordBooks('I study business and need AI without coding', index)
      .map(hit => hit.book.id)).toEqual(['b']);
  });
});
