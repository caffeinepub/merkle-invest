import { useMemo, useState } from 'react';
import { useGetResourcesPageContent } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Shield, Layers, Wrench, HelpCircle, AlertTriangle, Star, Info, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { parseMarkdownToIndexedLists } from '../utils/markdownParser';

export default function Resources() {
  const { data: resourceData, isLoading } = useGetResourcesPageContent();
  const [searchQuery, setSearchQuery] = useState('');

  const parsedData = useMemo(() => {
    if (!resourceData?.content) return null;
    return parseMarkdownToIndexedLists(resourceData.content);
  }, [resourceData]);

  const filteredData = useMemo(() => {
    if (!parsedData || !searchQuery.trim()) return parsedData;

    const query = searchQuery.toLowerCase().trim();
    
    // Filter list items
    const filteredItems = parsedData.listItems.filter(item => 
      item.text.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.importance.toLowerCase().includes(query)
    );

    // Filter sections and their items
    const filteredSections = parsedData.sections
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.text.toLowerCase().includes(query) ||
          item.section.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.importance.toLowerCase().includes(query)
        )
      }))
      .filter(section => 
        section.title.toLowerCase().includes(query) ||
        section.items.length > 0
      );

    // Group filtered items by category
    const byCategory: Record<string, typeof filteredItems> = {
      'Security': [],
      'Core Features': [],
      'Technical': [],
      'Support': [],
      'General': []
    };

    filteredItems.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });

    // Group filtered items by importance
    const byImportance: Record<string, typeof filteredItems> = {
      'Critical': [],
      'High': [],
      'Medium': [],
      'Low': []
    };

    filteredItems.forEach(item => {
      byImportance[item.importance].push(item);
    });

    return {
      listItems: filteredItems,
      sections: filteredSections,
      byCategory,
      byImportance
    };
  }, [parsedData, searchQuery]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'Core Features':
        return <Star className="h-5 w-5 text-amber-500" />;
      case 'Technical':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case 'Support':
        return <HelpCircle className="h-5 w-5 text-green-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'Critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'High':
        return <Star className="h-5 w-5 text-orange-500" />;
      case 'Medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'Low':
        return <Info className="h-5 w-5 text-gray-400" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImportanceBadgeVariant = (importance: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (importance) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No documentation content available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayData = filteredData || parsedData;
  const hasSearchResults = !searchQuery.trim() || (filteredData && filteredData.listItems.length > 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Resources & Documentation</h1>
        <p className="text-muted-foreground">
          Comprehensive indexed documentation for the Digital Money Secure Transaction System
        </p>
      </div>

      {/* Search Field */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          {searchQuery.trim() && (
            <div className="mt-3 text-sm text-muted-foreground">
              {hasSearchResults ? (
                <span>
                  Found <strong className="text-foreground">{displayData.listItems.length}</strong> result{displayData.listItems.length !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
              ) : (
                <span className="text-destructive">No results found for "{searchQuery}"</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!hasSearchResults ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Search className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse all documentation below
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{displayData.listItems.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {searchQuery.trim() ? 'Matching Items' : 'Total Items'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{displayData.sections.length}</div>
                  <div className="text-sm text-muted-foreground">Sections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Object.keys(displayData.byCategory).filter(k => displayData.byCategory[k].length > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {displayData.byImportance['Critical'].length + displayData.byImportance['High'].length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
              <TabsTrigger value="overview" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="core" className="gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Core</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="gap-2">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Technical</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
              <TabsTrigger value="critical" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Critical</span>
              </TabsTrigger>
              <TabsTrigger value="high" className="gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">High</span>
              </TabsTrigger>
              <TabsTrigger value="medium" className="gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Medium</span>
              </TabsTrigger>
              <TabsTrigger value="low" className="gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Low</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - All sections with their items */}
            <TabsContent value="overview" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {displayData.sections.map((section, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            {getCategoryIcon(section.category)}
                            <CardTitle className="text-xl">{section.title}</CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{section.category}</Badge>
                            <Badge variant={getImportanceBadgeVariant(section.importance)}>
                              {section.importance}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {section.items.length > 0 ? (
                          <ul className="space-y-2">
                            {section.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span className="flex-1">{item.text}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            {searchQuery.trim() ? 'No matching items in this section' : 'No indexed items in this section'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-red-500" />
                      <CardTitle>Security Resources</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byCategory['Security']?.length || 0} security-related items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byCategory['Security']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byCategory['Security'].map((item, idx) => (
                          <li key={idx} className="border-l-2 border-red-500 pl-4 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1">{item.text}</span>
                              <Badge variant={getImportanceBadgeVariant(item.importance)} className="shrink-0">
                                {item.importance}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching security items found' : 'No security items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* Core Features Tab */}
            <TabsContent value="core" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-amber-500" />
                      <CardTitle>Core Features</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byCategory['Core Features']?.length || 0} core feature items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byCategory['Core Features']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byCategory['Core Features'].map((item, idx) => (
                          <li key={idx} className="border-l-2 border-amber-500 pl-4 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1">{item.text}</span>
                              <Badge variant={getImportanceBadgeVariant(item.importance)} className="shrink-0">
                                {item.importance}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching core feature items found' : 'No core feature items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-6 w-6 text-blue-500" />
                      <CardTitle>Technical Documentation</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byCategory['Technical']?.length || 0} technical items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byCategory['Technical']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byCategory['Technical'].map((item, idx) => (
                          <li key={idx} className="border-l-2 border-blue-500 pl-4 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1">{item.text}</span>
                              <Badge variant={getImportanceBadgeVariant(item.importance)} className="shrink-0">
                                {item.importance}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching technical items found' : 'No technical items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-6 w-6 text-green-500" />
                      <CardTitle>Support & Help</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byCategory['Support']?.length || 0} support items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byCategory['Support']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byCategory['Support'].map((item, idx) => (
                          <li key={idx} className="border-l-2 border-green-500 pl-4 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1">{item.text}</span>
                              <Badge variant={getImportanceBadgeVariant(item.importance)} className="shrink-0">
                                {item.importance}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching support items found' : 'No support items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* Critical Priority Tab */}
            <TabsContent value="critical" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <CardTitle>Critical Priority Items</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byImportance['Critical']?.length || 0} critical items requiring immediate attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byImportance['Critical']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byImportance['Critical'].map((item, idx) => (
                          <li key={idx} className="border-l-4 border-red-600 pl-4 py-2 bg-red-50 dark:bg-red-950/20">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1 font-medium">{item.text}</span>
                              <Badge variant="outline" className="shrink-0">
                                {item.category}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching critical priority items found' : 'No critical priority items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* High Priority Tab */}
            <TabsContent value="high" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-orange-500" />
                      <CardTitle>High Priority Items</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byImportance['High']?.length || 0} high priority items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byImportance['High']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byImportance['High'].map((item, idx) => (
                          <li key={idx} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-950/20">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1">{item.text}</span>
                              <Badge variant="outline" className="shrink-0">
                                {item.category}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching high priority items found' : 'No high priority items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* Medium Priority Tab */}
            <TabsContent value="medium" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Info className="h-6 w-6 text-yellow-500" />
                      <CardTitle>Medium Priority Items</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byImportance['Medium']?.length || 0} medium priority items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byImportance['Medium']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byImportance['Medium'].map((item, idx) => (
                          <li key={idx} className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 dark:bg-yellow-950/20">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1">{item.text}</span>
                              <Badge variant="outline" className="shrink-0">
                                {item.category}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching medium priority items found' : 'No medium priority items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* Low Priority Tab */}
            <TabsContent value="low" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Info className="h-6 w-6 text-gray-400" />
                      <CardTitle>Low Priority Items</CardTitle>
                    </div>
                    <CardDescription>
                      {displayData.byImportance['Low']?.length || 0} low priority items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayData.byImportance['Low']?.length > 0 ? (
                      <ul className="space-y-3">
                        {displayData.byImportance['Low'].map((item, idx) => (
                          <li key={idx} className="border-l-4 border-gray-400 pl-4 py-2 bg-gray-50 dark:bg-gray-950/20">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex-1">{item.text}</span>
                              <Badge variant="outline" className="shrink-0">
                                {item.category}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Section: {item.section}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        {searchQuery.trim() ? 'No matching low priority items found' : 'No low priority items found'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
