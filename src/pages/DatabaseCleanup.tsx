import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  cleanupDuplicatePlayers, 
  cleanupDuplicateCategories, 
  cleanupDuplicateQuestions, 
  cleanupAllDuplicates 
} from '@/utils/databaseCleanup';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function DatabaseCleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    players?: number;
    categories?: number;
    questions?: number;
    error?: string;
  }>({});

  const handleCleanupPlayers = async () => {
    setIsLoading(true);
    setResults({});
    
    try {
      const result = await cleanupDuplicatePlayers();
      setResults({ players: result.removed });
    } catch (error: any) {
      setResults({ error: error.message || 'Failed to clean up players' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupCategories = async () => {
    setIsLoading(true);
    setResults({});
    
    try {
      const result = await cleanupDuplicateCategories();
      setResults({ categories: result.removed });
    } catch (error: any) {
      setResults({ error: error.message || 'Failed to clean up categories' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupQuestions = async () => {
    setIsLoading(true);
    setResults({});
    
    try {
      const result = await cleanupDuplicateQuestions();
      setResults({ questions: result.removed });
    } catch (error: any) {
      setResults({ error: error.message || 'Failed to clean up questions' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupAll = async () => {
    setIsLoading(true);
    setResults({});
    
    try {
      const result = await cleanupAllDuplicates();
      setResults(result);
    } catch (error: any) {
      setResults({ error: error.message || 'Failed to clean up database' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end mb-4">
        <Button variant="outline" asChild>
          <a href="/">← Back to Game</a>
        </Button>
      </div>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Database Cleanup Utility</CardTitle>
          <CardDescription>
            Remove duplicate players, categories, and questions from your database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{results.error}</AlertDescription>
            </Alert>
          )}

          {(results.players !== undefined || 
            results.categories !== undefined || 
            results.questions !== undefined) && (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle>Cleanup Results</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1">
                  {results.players !== undefined && (
                    <div>Players: {results.players} duplicate entries removed</div>
                  )}
                  {results.categories !== undefined && (
                    <div>Categories: {results.categories} duplicate entries removed</div>
                  )}
                  {results.questions !== undefined && (
                    <div>Questions: {results.questions} duplicate entries removed</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Individual Cleanup</h3>
              <div className="space-y-2">
                <Button 
                  onClick={handleCleanupPlayers} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Clean Players
                </Button>
                
                <Button 
                  onClick={handleCleanupCategories}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Clean Categories
                </Button>
                
                <Button 
                  onClick={handleCleanupQuestions}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Clean Questions
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Button 
                onClick={handleCleanupAll}
                disabled={isLoading}
                className="w-full h-32 text-lg"
                variant="default"
              >
                {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                Clean All Duplicates
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            This tool will remove duplicate entries in your database while keeping the most recent entry for each unique player, category, and question.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
