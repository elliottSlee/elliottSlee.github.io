import React from 'react'
import { ArrowRight, Check, AlertTriangle, ChevronDown, GitCommit, GitPullRequest, Play } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardOverview() {
  const environments = [
    { name: 'Dev', status: 'stable', pendingChanges: 3, lastCommit: '2h ago', alerts: 0 },
    { name: 'Test', status: 'pending', pendingChanges: 1, lastCommit: '1d ago', alerts: 1 },
    { name: 'Prod', status: 'stable', pendingChanges: 0, lastCommit: '3d ago', alerts: 0 },
  ]

  const changeLog = [
    { id: 1, author: 'Alice', timestamp: '2h ago', description: 'Updated user authentication', status: 'pending' },
    { id: 2, author: 'Bob', timestamp: '1d ago', description: 'Fixed pagination bug', status: 'approved' },
    { id: 3, author: 'Charlie', timestamp: '2d ago', description: 'Added new API endpoint', status: 'deployed' },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Environment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {environments.map((env) => (
          <Card key={env.name} className={`${env.status === 'stable' ? 'border-green-500' : env.status === 'pending' ? 'border-yellow-500' : 'border-red-500'} border-t-4`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {env.name}
                <Badge variant={env.status === 'stable' ? 'default' : 'secondary'}>{env.status}</Badge>
              </CardTitle>
              <CardDescription>Last commit: {env.lastCommit}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span>Pending Changes</span>
                <span>{env.pendingChanges}</span>
              </div>
              <Progress value={env.pendingChanges * 33} className="mb-2" />
              {env.alerts > 0 && (
                <div className="flex items-center text-yellow-500">
                  <AlertTriangle className="mr-2" />
                  <span>{env.alerts} alert{env.alerts > 1 ? 's' : ''}</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Details <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Change Log and Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Log */}
        <Card>
          <CardHeader>
            <CardTitle>Change Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {changeLog.map((change) => (
                <li key={change.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <GitCommit className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{change.description}</p>
                    <p className="text-sm text-gray-500">
                      {change.author} • {change.timestamp}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant={change.status === 'pending' ? 'secondary' : change.status === 'approved' ? 'default' : 'outline'}>
                      {change.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Comparison View */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dev-test">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dev-test">Dev vs Test</TabsTrigger>
                <TabsTrigger value="test-prod">Test vs Prod</TabsTrigger>
              </TabsList>
              <TabsContent value="dev-test" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">3 changes pending</span>
                    <Button size="sm">
                      Promote to Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
                      <code>
                        {`+ New feature added
- Removed deprecated function
~ Modified existing API`}
                      </code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="test-prod" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">1 change pending</span>
                    <Button size="sm">
                      Promote to Prod <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
                      <code>
                        {`~ Updated user authentication process`}
                      </code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button>
          <GitCommit className="mr-2 h-4 w-4" /> Commit Changes
        </Button>
        <Button variant="secondary">
          <GitPullRequest className="mr-2 h-4 w-4" /> Create Pull Request
        </Button>
        <Button variant="outline">
          <Play className="mr-2 h-4 w-4" /> Deploy to Test
        </Button>
        <Button variant="outline">
          <Play className="mr-2 h-4 w-4" /> Deploy to Prod
        </Button>
      </div>
    </div>
  )
}