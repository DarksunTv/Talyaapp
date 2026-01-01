'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface ContractPreviewProps {
  contract: any;
}

export function ContractPreview({ contract }: Readonly<ContractPreviewProps>) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Contract</title>');
      printWindow.document.write('<style>body{font-family:monospace;white-space:pre-wrap;padding:20px;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(contract.content);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Print/Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-6 border rounded-lg">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {contract.content}
          </pre>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Status: <span className="font-medium capitalize">{contract.status}</span></p>
          <p>Created: {new Date(contract.created_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
