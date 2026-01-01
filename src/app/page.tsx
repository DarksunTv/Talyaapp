import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageSquare, FileText, Brain, BarChart3, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            TalyaCRM
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            AI-Powered Roofing CRM
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline your roofing business with intelligent customer management, 
            AI-powered communications, and automated workflows.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Phone className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Caller</CardTitle>
              <CardDescription>
                Automated customer calls with conversation memory and natural language processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Communications</CardTitle>
              <CardDescription>
                Unified SMS and voice with AI summarization and interaction history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Estimates & Contracts</CardTitle>
              <CardDescription>
                Professional estimate builder and automated contract generation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Context-aware chat for project insights and intelligent recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track projects, customers, and business metrics in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Automation</CardTitle>
              <CardDescription>
                Automated reminders, notifications, and workflow management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Transform your roofing business with AI-powered tools
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Launch Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} TalyaCRM. Built for roofing professionals.</p>
        </div>
      </footer>
    </div>
  );
}
