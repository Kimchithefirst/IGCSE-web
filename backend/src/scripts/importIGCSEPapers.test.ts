import ImportIGCSEPapers from './importIGCSEPapers'; // Adjust path if necessary

// The STOP_WORDS array is defined in importIGCSEPapers.ts and will be used by the extractKeywords method.

describe('ImportIGCSEPapers - extractKeywords', () => {
  const importer = new ImportIGCSEPapers(); // Instance of the class

  test('should extract basic keywords and convert to lowercase', () => {
    const text = 'This is a Simple Test String with MixedCase';
    const expectedKeywords = ['simple', 'test', 'string', 'mixedcase'];
    expect(importer.extractKeywords(text)).toEqual(expect.arrayContaining(expectedKeywords));
    expect(importer.extractKeywords(text).length).toBe(expectedKeywords.length);
  });

  test('should remove stop words', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    // Assuming 'quick', 'brown', 'fox', 'jumps', 'lazy', 'dog' are not stop words and >= 3 chars
    const expectedKeywords = ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog'];
    expect(importer.extractKeywords(text)).toEqual(expect.arrayContaining(expectedKeywords));
    expect(importer.extractKeywords(text).length).toBe(expectedKeywords.length);
  });

  test('should filter out short words but keep numbers', () => {
    const text = 'A cat sat on 1 mat with 2 dogs and 10 birds';
    // 'cat', 'sat', 'mat', 'dogs', 'birds' are not stop words and >=3 chars
    // '1', '2', '10' are numbers
    const expectedKeywords = ['cat', 'sat', 'mat', 'dogs', '10', 'birds', '1', '2'];
    const result = importer.extractKeywords(text);
    expect(result).toEqual(expect.arrayContaining(expectedKeywords));
    expect(result.length).toBe(expectedKeywords.length);
  });

  test('should handle various punctuation correctly', () => {
    const text = 'Hello, world! This-is-a-test. (Example: sentence). Values: 100, 200.';
    // Assuming 'hello', 'world', 'test', 'example', 'sentence', 'values', '100', '200' are expected
    const expectedKeywords = ['hello', 'world', 'this-is-a-test', 'example', 'sentence', 'values', '100', '200'];
     // The regex /[\s\p{P}]+/u splits by punctuation, so "this-is-a-test" becomes "this-is-a-test" if not split further.
     // If it splits hyphens, then it would be ['this', 'test']. Current regex keeps it.
    const result = importer.extractKeywords(text);
    expect(result).toEqual(expect.arrayContaining(expectedKeywords));
    expect(result.length).toBe(expectedKeywords.length);
  });

  test('should return unique keywords', () => {
    const text = 'test test Test TEST unique Unique';
    const expectedKeywords = ['test', 'unique'];
    expect(importer.extractKeywords(text)).toEqual(expect.arrayContaining(expectedKeywords));
    expect(importer.extractKeywords(text).length).toBe(expectedKeywords.length);
  });

  test('should handle empty string input', () => {
    const text = '';
    expect(importer.extractKeywords(text)).toEqual([]);
  });

  test('should handle string with only stop words', () => {
    const text = 'this is the and of for a';
    expect(importer.extractKeywords(text)).toEqual([]);
  });

  test('should handle string with only stop words and short words', () => {
    const text = 'it is on as we go up by';
    expect(importer.extractKeywords(text)).toEqual([]);
  });

  test('should handle string with only punctuation', () => {
    const text = '!!! ... --- ???';
    expect(importer.extractKeywords(text)).toEqual([]);
  });

  test('should handle string with mixed-case stop words', () => {
    const text = 'The Quick Brown Fox Jumps Over THE Lazy Dog';
    // 'Quick', 'Brown', 'Fox', 'Jumps', 'Lazy', 'Dog'
    const expectedKeywords = ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog'];
    expect(importer.extractKeywords(text)).toEqual(expect.arrayContaining(expectedKeywords));
    expect(importer.extractKeywords(text).length).toBe(expectedKeywords.length);
  });

  test('should handle text with numbers and words', () => {
    const text = 'Chapter 1 discusses topic Alpha, section 2.5 covers Beta and point 300';
    // 'chapter', 'discusses', 'topic', 'alpha', 'section', 'covers', 'beta', 'point'
    // '1', '2.5' (becomes '2', '5' due to punctuation split), '300'
    // Current regex /[\s\p{P}]+/u will split "2.5" into "2" and "5".
    // If "2.5" should be kept, the regex needs adjustment. For now, test current behavior.
    const expectedKeywords = ['chapter', 'discusses', 'topic', 'alpha', 'section', 'covers', 'beta', 'point', '1', '2', '5', '300'];
    const result = importer.extractKeywords(text);
    expect(result).toEqual(expect.arrayContaining(expectedKeywords));
    expect(result.length).toBe(expectedKeywords.length);
  });

  test('should not filter out numeric strings like "0625" even if length is not >= 3 after split', () => {
    // This test depends on the filter: word.length >= 3 || /^\d+$/.test(word)
    const text = "Paper 0625 and item 42 variant 1";
    const expectedKeywords = ['paper', '0625', 'item', '42', 'variant', '1'];
    const result = importer.extractKeywords(text);
    expect(result).toEqual(expect.arrayContaining(expectedKeywords));
    expect(result.length).toBe(expectedKeywords.length);
  });

  test('should handle null or undefined input gracefully', () => {
    expect(importer.extractKeywords(null as any)).toEqual([]);
    expect(importer.extractKeywords(undefined as any)).toEqual([]);
  });

  test('should handle words with internal hyphens or apostrophes if regex allows', () => {
    // The current regex /[\s\p{P}]+/u might split "state-of-the-art" or keep it.
    // If it splits: "state", "art" (assuming "of", "the" are stop words)
    // If it keeps: "state-of-the-art"
    // Based on /[\s\p{P}]+/u, it typically splits them. Let's test that expectation.
    // To keep them, a more complex regex is needed.
    let text = "This is state-of-the-art technology. It's O'Malley's belief.";
    let expected = ['state', 'art', 'technology', "o'malley's", 'belief']; // current regex splits "it's" into "s" -> filtered
                                                                        // and "O'Malley's" might become "o'malley's" or "o", "malley", "s"
                                                                        // Let's assume the regex keeps "o'malley's" as one token after lowercasing.
                                                                        // And "it's" becomes "s" which is filtered by length.

    // Re-evaluating the regex: \p{P} includes hyphens and apostrophes.
    // So "state-of-the-art" -> "state", "of", "the", "art" -> "state", "art"
    // "It's" -> "it", "s" -> (both filtered or 's' filtered)
    // "O'Malley's" -> "o", "malley", "s" -> "malley"
    // This means the regex is quite aggressive with punctuation.
    expected = ['state', 'art', 'technology', 'malley', 'belief'];
    expect(importer.extractKeywords(text)).toEqual(expect.arrayContaining(expected));
    expect(importer.extractKeywords(text).length).toBe(expected.length);

    text = "Part-time job"; // "part-time", "job"
    expected = ["part-time", "job"]; // Assuming the regex might keep hyphenated words if they don't contain other punctuation
                                    // The current regex will split it. "part", "time", "job"
    expected = ["part", "time", "job"];
    expect(importer.extractKeywords(text)).toEqual(expect.arrayContaining(expected));
    expect(importer.extractKeywords(text).length).toBe(expected.length);

  });
});
