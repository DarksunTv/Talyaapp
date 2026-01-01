'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { createEstimate, updateEstimate, calculateEstimateTotals, type LineItem } from '@/app/actions/estimates';
import { v4 as uuidv4 } from 'uuid';

interface EstimateBuilderProps {
  projectId: string;
  existingEstimate?: any;
  onSave?: () => void;
}

export function EstimateBuilder({ projectId, existingEstimate, onSave }: Readonly<EstimateBuilderProps>) {
  const [lineItems, setLineItems] = useState<LineItem[]>(
    existingEstimate?.line_items || [
      { id: uuidv4(), description: '', quantity: 1, unit: 'sq ft', unitPrice: 0, total: 0 },
    ]
  );
  const [taxRate, setTaxRate] = useState(0.08); // 8% default
  const [notes, setNotes] = useState(existingEstimate?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const totals = calculateEstimateTotals(lineItems, taxRate);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: uuidv4(), description: '', quantity: 1, unit: 'sq ft', unitPrice: 0, total: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalculate total
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const estimateData = {
        lineItems,
        subtotal: totals.subtotal,
        taxRate,
        tax: totals.tax,
        total: totals.total,
        notes,
      };

      const result = existingEstimate
        ? await updateEstimate(existingEstimate.id, estimateData)
        : await createEstimate(projectId, estimateData);

      if (result.success) {
        onSave?.();
      } else {
        alert(result.error || 'Failed to save estimate');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Line Items */}
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 text-sm text-muted-foreground">
                {index + 1}
              </div>
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                className="col-span-4 px-2 py-1 border rounded text-sm"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                className="col-span-2 px-2 py-1 border rounded text-sm"
              />
              <select
                value={item.unit}
                onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                className="col-span-2 px-2 py-1 border rounded text-sm"
              >
                <option value="sq ft">sq ft</option>
                <option value="linear ft">linear ft</option>
                <option value="each">each</option>
                <option value="bundle">bundle</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={item.unitPrice}
                onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                className="col-span-2 px-2 py-1 border rounded text-sm"
              />
              <div className="col-span-1 text-sm font-medium">
                ${item.total.toFixed(2)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLineItem(item.id)}
                disabled={lineItems.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={addLineItem} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Tax Rate:</span>
            <input
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-20 px-2 py-1 border rounded text-sm text-right"
            />
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span className="font-medium">${totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Estimate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
