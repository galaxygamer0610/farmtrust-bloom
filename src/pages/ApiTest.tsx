import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkHealth, getEnumConfig, submitAssessment, mapFormDataToBackendRequest } from "@/services/api";
import { CheckCircle2, XCircle, Loader2, Server, Database, Brain } from "lucide-react";

const ApiTest = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [enumsData, setEnumsData] = useState<any>(null);
  const [enumsLoading, setEnumsLoading] = useState(false);
  const [enumsError, setEnumsError] = useState<string | null>(null);

  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const testHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const result = await checkHealth();
      setHealthStatus(result);
    } catch (error: any) {
      setHealthError(error.message);
    } finally {
      setHealthLoading(false);
    }
  };

  const testEnums = async () => {
    setEnumsLoading(true);
    setEnumsError(null);
    try {
      const result = await getEnumConfig();
      setEnumsData(result);
    } catch (error: any) {
      setEnumsError(error.message);
    } finally {
      setEnumsLoading(false);
    }
  };

  const testAssessment = async () => {
    setAssessmentLoading(true);
    setAssessmentError(null);
    try {
      // Sample test data
      const testData = {
        name: "Test Farmer",
        village: "Test Village",
        farmSize: "5",
        mainCrop: "Wheat",
        region: "fertile",
        operationQuarter: "kharif",
        revenue: "280000",
        expenses: "195000",
        loanAmount: "50000",
      };

      const backendRequest = mapFormDataToBackendRequest(testData);
      const result = await submitAssessment(backendRequest);
      setAssessmentData(result);
    } catch (error: any) {
      setAssessmentError(error.message);
    } finally {
      setAssessmentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Backend API Test</h1>
          <p className="text-muted-foreground">Test the integration between frontend and backend</p>
        </div>

        <div className="space-y-6">
          {/* Health Check Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  <CardTitle>Health Check</CardTitle>
                </div>
                {healthStatus && <Badge variant="default">✓ Connected</Badge>}
                {healthError && <Badge variant="destructive">✗ Failed</Badge>}
              </div>
              <CardDescription>Test if the backend server is running</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testHealth} disabled={healthLoading} className="mb-4">
                {healthLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Health Endpoint"
                )}
              </Button>

              {healthStatus && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">Backend is running!</p>
                      <pre className="mt-2 overflow-x-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900">
                        {JSON.stringify(healthStatus, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {healthError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-100">Connection failed</p>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-300">{healthError}</p>
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Make sure the backend is running: <code>cd backend && npm run dev</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enums Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-secondary" />
                  <CardTitle>Enum Configuration</CardTitle>
                </div>
                {enumsData && <Badge variant="default">✓ Loaded</Badge>}
                {enumsError && <Badge variant="destructive">✗ Failed</Badge>}
              </div>
              <CardDescription>Test fetching dropdown values from backend</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testEnums} disabled={enumsLoading} className="mb-4">
                {enumsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Test Enums Endpoint"
                )}
              </Button>

              {enumsData && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">Enums loaded successfully!</p>
                      <pre className="mt-2 overflow-x-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900">
                        {JSON.stringify(enumsData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {enumsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-100">Failed to load enums</p>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-300">{enumsError}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-kisan-leaf" />
                  <CardTitle>Credit Assessment</CardTitle>
                </div>
                {assessmentData && <Badge variant="default">✓ Success</Badge>}
                {assessmentError && <Badge variant="destructive">✗ Failed</Badge>}
              </div>
              <CardDescription>Test the full assessment flow with sample data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testAssessment} disabled={assessmentLoading} className="mb-4">
                {assessmentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Test Assessment Endpoint"
                )}
              </Button>

              {assessmentData && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">Assessment completed!</p>
                      <div className="mt-2 space-y-2">
                        <div className="rounded bg-green-100 p-2 dark:bg-green-900">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            Credit Score: {assessmentData.credit_score}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Risk: {assessmentData.risk_category}
                          </p>
                        </div>
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-green-900 dark:text-green-100">
                            View Full Response
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded bg-green-100 p-2 text-xs dark:bg-green-900">
                            {JSON.stringify(assessmentData, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {assessmentError && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">Assessment failed</p>
                      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">{assessmentError}</p>
                      <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                        This is expected if the ML microservice isn't configured yet. The frontend will fall back to local calculation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Make sure the backend is running: <code className="rounded bg-muted px-1 py-0.5">cd backend && npm run dev</code></p>
              <p>2. Click each "Test" button above to verify the integration</p>
              <p>3. Health Check should return "ok" status</p>
              <p>4. Enums should return lists of valid values</p>
              <p>5. Assessment may fail if ML service isn't configured (this is expected)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
