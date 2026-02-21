import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { FeatureItem } from '../types/features';
import { parseFeaturesFromMarkdown } from '../utils/featuresParser';
import { paginate } from '../utils/pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Search, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function Features() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Filter features based on search query
  const filtered = useMemo(
    () => features.filter(f => f.text.toLowerCase().includes(search.toLowerCase())),
    [features, search]
  );

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageClamped = Math.min(totalPages, currentPage);

  // Get paginated items
  const paged = useMemo(
    () => paginate(filtered, pageSize, currentPageClamped),
    [filtered, pageSize, currentPageClamped]
  );

  // Clamp current page when filtered results or page size changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(totalPages.toString());
    }
  }, [totalPages, currentPage]);

  // Handle file selection
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadStatus('idle');
      setUploadProgress(0);
      setStatusMessage('');
      return;
    }

    if (!file.name.endsWith('.md')) {
      toast.error('Invalid file type', {
        description: 'Please select a .md (Markdown) file',
      });
      event.target.value = '';
      setSelectedFile(null);
      setUploadStatus('idle');
      setUploadProgress(0);
      setStatusMessage('');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadProgress(0);
    setStatusMessage('');
  };

  // Handle file upload and processing
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setStatusMessage('Reading file...');

    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
            setStatusMessage(`Reading file: ${percentComplete}%`);
          }
        };

        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            setUploadProgress(100);
            setStatusMessage('Processing features...');
            resolve(result);
          } else {
            reject(new Error('Failed to read file content'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(selectedFile);
      });

      // Small delay to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 200));

      const extractedFeatures = parseFeaturesFromMarkdown(content);

      if (extractedFeatures.length === 0) {
        setUploadStatus('error');
        setStatusMessage('No features found in file');
        toast.error('No features found', {
          description: 'The markdown file does not contain a "Features/Functions:" section or it is empty',
        });
        setIsProcessing(false);
        return;
      }

      setFeatures(extractedFeatures);
      setSearch('');
      setCurrentPage(1);
      setPageInput('1');
      setUploadStatus('success');
      setStatusMessage(`Successfully extracted ${extractedFeatures.length} feature${extractedFeatures.length !== 1 ? 's' : ''}`);

      toast.success('File processed successfully', {
        description: `Extracted ${extractedFeatures.length} feature${extractedFeatures.length !== 1 ? 's' : ''} from ${selectedFile.name}`,
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to process file');
      toast.error('Failed to process file', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
    setPageInput('1');
  };

  // Handle page navigation
  const goToFirstPage = () => {
    setCurrentPage(1);
    setPageInput('1');
  };

  const goToPreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
  };

  const goToNextPage = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
    setPageInput(totalPages.toString());
  };

  // Handle page input change
  const handlePageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum)) {
      const clampedPage = Math.min(totalPages, Math.max(1, pageNum));
      setCurrentPage(clampedPage);
      setPageInput(clampedPage.toString());
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Features/Functions:</h1>
        <p className="text-muted-foreground">
          Upload a markdown file to extract and view features in a paginated list
        </p>
      </div>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Markdown File
          </CardTitle>
          <CardDescription>
            Select a .md file containing a "Features/Functions:" section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <FileText className="h-4 w-4" />
                  Choose File
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".md"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              {selectedFile && (
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-muted-foreground">
                    Selected: <strong className="text-foreground">{selectedFile.name}</strong>
                  </span>
                  <Button
                    onClick={handleUpload}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Upload Progress Indicator */}
            {uploadStatus !== 'idle' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{statusMessage}</span>
                  {uploadStatus === 'uploading' && (
                    <span className="font-medium text-foreground">{uploadProgress}%</span>
                  )}
                  {uploadStatus === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                  )}
                  {uploadStatus === 'error' && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                {uploadStatus === 'uploading' && (
                  <Progress value={uploadProgress} className="h-2" />
                )}
                {uploadStatus === 'success' && (
                  <div className="h-2 bg-green-600 dark:bg-green-500 rounded-full" />
                )}
                {uploadStatus === 'error' && (
                  <div className="h-2 bg-destructive rounded-full" />
                )}
              </div>
            )}

            {features.length > 0 && uploadStatus === 'idle' && (
              <div className="text-sm text-muted-foreground">
                Extracted <strong className="text-foreground">{features.length}</strong> feature{features.length !== 1 ? 's' : ''} from the file
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {features.length > 0 && (
        <>
          {/* Search and Page Size Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                    Search Features
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by feature text..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {search && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Found <strong className="text-foreground">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="page-size" className="text-sm font-medium mb-2 block">
                    Items per page
                  </Label>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger id="page-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Table */}
          {filtered.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Features List</CardTitle>
                <CardDescription>
                  Showing {((currentPageClamped - 1) * pageSize) + 1} - {Math.min(currentPageClamped * pageSize, filtered.length)} of {filtered.length} feature{filtered.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">ID</TableHead>
                        <TableHead>Feature Text</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paged.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-mono text-sm">{feature.id}</TableCell>
                          <TableCell>{feature.text}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronFirst className="h-4 w-4" />
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <Input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={pageInput}
                      onChange={handlePageInputChange}
                      onBlur={handlePageInputBlur}
                      onKeyDown={handlePageInputKeyDown}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">of {totalPages}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      Last
                      <ChevronLast className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Search className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      No features match your search query "{search}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {features.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No file uploaded</h3>
                <p className="text-muted-foreground">
                  Upload a markdown file to extract and view features
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
