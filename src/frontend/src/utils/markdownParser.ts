interface ListItem {
  text: string;
  section: string;
  category: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  lineNumber: number;
}

interface ParsedMarkdown {
  listItems: ListItem[];
  sections: {
    title: string;
    category: string;
    importance: 'Critical' | 'High' | 'Medium' | 'Low';
    items: ListItem[];
  }[];
  byCategory: Record<string, ListItem[]>;
  byImportance: Record<string, ListItem[]>;
}

export function parseMarkdownToIndexedLists(content: string): ParsedMarkdown {
  const lines = content.split('\n');
  const listItems: ListItem[] = [];
  const sections: ParsedMarkdown['sections'] = [];
  
  let currentSection = '';
  let currentCategory = 'General';
  let currentImportance: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
  
  lines.forEach((line, index) => {
    // Detect section headers (## Header)
    if (line.startsWith('## ') && !line.includes('Table of Contents')) {
      currentSection = line.replace('## ', '').trim();
      
      // Categorize sections
      const lowerTitle = currentSection.toLowerCase();
      if (lowerTitle.includes('security') || 
          lowerTitle.includes('authentication') || 
          lowerTitle.includes('authorization') ||
          lowerTitle.includes('access control')) {
        currentCategory = 'Security';
        currentImportance = 'Critical';
      } else if (lowerTitle.includes('transaction') || 
                 lowerTitle.includes('investment')) {
        currentCategory = 'Core Features';
        currentImportance = 'High';
      } else if (lowerTitle.includes('backend') || 
                 lowerTitle.includes('frontend') || 
                 lowerTitle.includes('api') ||
                 lowerTitle.includes('architecture') ||
                 lowerTitle.includes('data structure') ||
                 lowerTitle.includes('session management')) {
        currentCategory = 'Technical';
        currentImportance = 'High';
      } else if (lowerTitle.includes('faq') || 
                 lowerTitle.includes('support') || 
                 lowerTitle.includes('error')) {
        currentCategory = 'Support';
        currentImportance = 'Low';
      } else if (lowerTitle.includes('overview') || 
                 lowerTitle.includes('key features')) {
        currentCategory = 'Core Features';
        currentImportance = 'High';
      } else {
        currentCategory = 'Technical';
        currentImportance = 'Medium';
      }
      
      sections.push({
        title: currentSection,
        category: currentCategory,
        importance: currentImportance,
        items: []
      });
    }
    
    // Extract list items (lines starting with -)
    if (line.trim().startsWith('- ') && currentSection) {
      const text = line.trim().replace(/^- /, '');
      const item: ListItem = {
        text,
        section: currentSection,
        category: currentCategory,
        importance: currentImportance,
        lineNumber: index + 1
      };
      listItems.push(item);
      
      // Add to current section
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        lastSection.items.push(item);
      }
    }
  });
  
  // Group by category
  const byCategory: Record<string, ListItem[]> = {
    'Security': [],
    'Core Features': [],
    'Technical': [],
    'Support': [],
    'General': []
  };
  
  listItems.forEach(item => {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
    }
    byCategory[item.category].push(item);
  });
  
  // Group by importance
  const byImportance: Record<string, ListItem[]> = {
    'Critical': [],
    'High': [],
    'Medium': [],
    'Low': []
  };
  
  listItems.forEach(item => {
    byImportance[item.importance].push(item);
  });
  
  return {
    listItems,
    sections,
    byCategory,
    byImportance
  };
}
