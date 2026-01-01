import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderKanban, FileText, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  // TODO: Fetch real data from Supabase
  const stats = {
    totalCustomers: 0,
    activeProjects: 0,
    pendingEstimates: 0,
    recentCommunications: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to TalyaCRM</h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your roofing business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customer accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Projects in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Estimates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEstimates}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting customer response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentCommunications}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/customers/new">
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </Link>
          <Link href="/dashboard/projects/new">
            <Button className="w-full" variant="outline">
              <FolderKanban className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
          <Link href="/dashboard/customers">
            <Button className="w-full" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send SMS
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create Estimate
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Activity will appear here as you use the system</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>Your business metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Project Value</span>
                <span className="font-medium">$0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="font-medium">-</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to set up your CRM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <p className="font-medium">Add your first customer</p>
              <p className="text-sm text-muted-foreground">Start building your customer database</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <p className="font-medium">Create a project</p>
              <p className="text-sm text-muted-foreground">Track your roofing jobs from start to finish</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <p className="font-medium">Build an estimate</p>
              <p className="text-sm text-muted-foreground">Create professional estimates with our builder</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div>
              <p className="font-medium">Configure communications</p>
              <p className="text-sm text-muted-foreground">Set up Twilio and Vapi for SMS and AI calls</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
