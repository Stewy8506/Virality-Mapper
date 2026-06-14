/**
 * Converts stylized/mathematical unicode bold/italic characters back to standard alphanumeric characters.
 * Enforces accessibility compliance for screen readers and improves LinkedIn's internal search indexing.
 */
export function convertUnicodeStyles(text: string): string {
  let result = "";
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (!cp) {
      result += char;
      continue;
    }

    // Bold Serif: A-Z (0x1D400 - 0x1D419) -> 65-90, a-z (0x1D41A - 0x1D433) -> 97-122
    if (cp >= 0x1D400 && cp <= 0x1D419) { result += String.fromCodePoint(cp - 0x1D400 + 65); continue; }
    if (cp >= 0x1D41A && cp <= 0x1D433) { result += String.fromCodePoint(cp - 0x1D41A + 97); continue; }

    // Italic Serif: A-Z (0x1D434 - 0x1D44D) -> 65-90, a-z (0x1D44E - 0x1D467) -> 97-122
    if (cp >= 0x1D434 && cp <= 0x1D44D) { result += String.fromCodePoint(cp - 0x1D434 + 65); continue; }
    if (cp >= 0x1D44E && cp <= 0x1D467) { result += String.fromCodePoint(cp - 0x1D44E + 97); continue; }

    // Bold Italic Serif: A-Z (0x1D468 - 0x1D481) -> 65-90, a-z (0x1D482 - 0x1D49B) -> 97-122
    if (cp >= 0x1D468 && cp <= 0x1D481) { result += String.fromCodePoint(cp - 0x1D468 + 65); continue; }
    if (cp >= 0x1D482 && cp <= 0x1D49B) { result += String.fromCodePoint(cp - 0x1D482 + 97); continue; }

    // Double-struck (Outline): A-Z (0x1D538 - 0x1D551) -> 65-90, a-z (0x1D552 - 0x1D56B) -> 97-122
    if (cp >= 0x1D538 && cp <= 0x1D551) { result += String.fromCodePoint(cp - 0x1D538 + 65); continue; }
    if (cp >= 0x1D552 && cp <= 0x1D56B) { result += String.fromCodePoint(cp - 0x1D552 + 97); continue; }

    // Sans-serif Normal: A-Z (0x1D5A0 - 0x1D5B9) -> 65-90, a-z (0x1D5BA - 0x1D5D3) -> 97-122
    if (cp >= 0x1D5A0 && cp <= 0x1D5B9) { result += String.fromCodePoint(cp - 0x1D5A0 + 65); continue; }
    if (cp >= 0x1D5BA && cp <= 0x1D5D3) { result += String.fromCodePoint(cp - 0x1D5BA + 97); continue; }

    // Sans-serif Bold: A-Z (0x1D5D4 - 0x1D5ED) -> 65-90, a-z (0x1D5EE - 0x1D607) -> 97-122
    if (cp >= 0x1D5D4 && cp <= 0x1D5ED) { result += String.fromCodePoint(cp - 0x1D5D4 + 65); continue; }
    if (cp >= 0x1D5EE && cp <= 0x1D607) { result += String.fromCodePoint(cp - 0x1D608 + 97); continue; }

    // Sans-serif Italic: A-Z (0x1D608 - 0x1D621) -> 65-90, a-z (0x1D622 - 0x1D63B) -> 97-122
    if (cp >= 0x1D608 && cp <= 0x1D621) { result += String.fromCodePoint(cp - 0x1D608 + 65); continue; }
    if (cp >= 0x1D622 && cp <= 0x1D63B) { result += String.fromCodePoint(cp - 0x1D622 + 97); continue; }

    // Sans-serif Bold Italic: A-Z (0x1D63C - 0x1D655) -> 65-90, a-z (0x1D656 - 0x1D66F) -> 97-122
    if (cp >= 0x1D63C && cp <= 0x1D655) { result += String.fromCodePoint(cp - 0x1D63C + 65); continue; }
    if (cp >= 0x1D656 && cp <= 0x1D66F) { result += String.fromCodePoint(cp - 0x1D656 + 97); continue; }

    // Monospace: A-Z (0x1D670 - 0x1D689) -> 65-90, a-z (0x1D68A - 0x1D6A3) -> 97-122
    if (cp >= 0x1D670 && cp <= 0x1D689) { result += String.fromCodePoint(cp - 0x1D670 + 65); continue; }
    if (cp >= 0x1D68A && cp <= 0x1D6A3) { result += String.fromCodePoint(cp - 0x1D68A + 97); continue; }

    // Math bold digits 0-9: 0x1D7CE - 0x1D7D7 -> 48-57
    if (cp >= 0x1D7CE && cp <= 0x1D7D7) { result += String.fromCodePoint(cp - 0x1D7CE + 48); continue; }
    // Math sans bold digits 0-9: 0x1D7EC - 0x1D7F5 -> 48-57
    if (cp >= 0x1D7EC && cp <= 0x1D7F5) { result += String.fromCodePoint(cp - 0x1D7EC + 48); continue; }

    result += char;
  }
  return result;
}

/**
 * Optimizes line-breaks and sentence spacing to maximize "Dwell Time" on mobile screens.
 * Ensures a maximum of 2 sentences per paragraph block, separated by clean double newlines.
 */
export function optimizeMobileSpacing(text: string): string {
  // First normalize newlines and trim blocks
  const rawParagraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const formattedParagraphs: string[] = [];

  for (const para of rawParagraphs) {
    // Skip formatting bullet lists, visual proof markdown, hot takes, or CTA lines
    if (
      para.startsWith("[Insert") || 
      para.startsWith("Hot take:") || 
      para.toLowerCase().includes("agree or disagree") ||
      para.toLowerCase().includes("comment") ||
      /^[•\-*⚡🛡️🚀💡🎨📈🔋💸🔥📢⭐👇]/.test(para)
    ) {
      formattedParagraphs.push(para);
      continue;
    }

    // Split general paragraphs by sentence boundaries (. ! ?)
    // Look behinds are standard in modern V8 engines, but simple split/matches are safer
    const sentenceEndRegex = /([^.!?]+[.!?]+)\s*/g;
    const sentences: string[] = [];
    let match;
    while ((match = sentenceEndRegex.exec(para)) !== null) {
      sentences.push(match[1].trim());
    }

    // If split failed or sentence array is empty, keep original paragraph
    if (sentences.length === 0) {
      formattedParagraphs.push(para);
      continue;
    }

    // Group sentences in pairs of 1 or 2 max
    let currentBlock: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      currentBlock.push(sentences[i]);
      if (currentBlock.length === 2 || i === sentences.length - 1) {
        formattedParagraphs.push(currentBlock.join(" "));
        currentBlock = [];
      }
    }
  }

  // Combine back with clear paragraph spacing
  return formattedParagraphs.join("\n\n");
}

/**
 * Counts syllables in a word using basic rule heuristics.
 */
function countSyllablesInWord(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  if (cleanWord.length <= 3) return 1;

  // Simple vowel matching
  let vowelMatches = cleanWord.match(/[aeiouy]+/g);
  let count = vowelMatches ? vowelMatches.length : 0;

  // Subtract silent 'e' at end
  if (cleanWord.endsWith("e") && !cleanWord.endsWith("le")) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Estimates the Flesch-Kincaid Readability Ease score and US Grade Level equivalent.
 */
export function estimateReadability(text: string): { gradeLevel: string; easeScore: number } {
  // Strip code elements, image tags, and emojis for raw text metric calculation
  const cleanText = text
    .replace(/\[Insert[^\]]*\]/g, "")
    .replace(/[^\w\s.!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    return { gradeLevel: "Grade 6", easeScore: 80 };
  }

  // Count sentences
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const sentenceCount = Math.max(1, sentences.length);

  // Count words
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = Math.max(1, words.length);

  // Count syllables
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllablesInWord(word);
  }

  // Flesch-Kincaid formulas:
  // Flesch Reading Ease = 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  // Flesch-Kincaid Grade Level = 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  const easeScore = Math.round(
    Math.max(0, Math.min(100, 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord))
  );

  const rawGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const gradeLevelInt = Math.max(1, Math.round(rawGrade));

  let gradeLevel = `Grade ${gradeLevelInt}`;
  if (gradeLevelInt > 12) {
    gradeLevel = "College/Graduate";
  } else if (gradeLevelInt <= 5) {
    gradeLevel = "Elementary (K-5)";
  }

  return { gradeLevel, easeScore };
}
