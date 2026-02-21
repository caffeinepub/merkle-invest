import { FeatureItem } from '../types/features';

/**
 * Parses markdown content and extracts features under "Features/Functions:" heading
 */
export function parseFeaturesFromMarkdown(markdownContent: string): FeatureItem[] {
  const lines = markdownContent.split('\n');
  
  // Find the line index where "Features/Functions:" appears
  const startIndex = lines.findIndex(line => {
    const trimmed = line.trim();
    return trimmed === 'Features/Functions:' || trimmed.startsWith('Features/Functions:');
  });

  if (startIndex === -1) {
    return [];
  }

  const features: FeatureItem[] = [];
  let id = 1;

  // Start from the line after the heading
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Stop if we hit another top-level heading (starts with #)
    if (trimmed.startsWith('#')) {
      break;
    }

    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Extract text by removing bullet markers (-, *, numbered lists)
    let text = trimmed;
    
    // Remove markdown list markers
    text = text.replace(/^[-*]\s+/, ''); // Remove - or * bullets
    text = text.replace(/^\d+\.\s+/, ''); // Remove numbered lists like "1. "
    
    // Only add if there's actual content after removing markers
    if (text.trim()) {
      features.push({
        id,
        text: text.trim(),
        rawLine: line,
      });
      id++;
    }
  }

  return features;
}
