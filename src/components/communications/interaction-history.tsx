'use client';

import { useEffect, useState } from 'react';
import { getCustomerCommunications } from '@/app/actions/communications';
import { Phone, MessageSquare, Bot, Mail, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Communication {
  id: string;
  type: 'call' | 'sms' | 'email' | 'ai_call';
  direction: 'inbound' | 'outbound';
  content: string | null;
  ai_summary: string | null;
  recording_url: string | null;
  duration_seconds: number | null;
  created_at: string;
  created_by_profile: {
    name: string;
    email: string;
  } | null;
}

interface InteractionHistoryProps {
  customerId: string;
}

const ICON_MAP = {
  call: Phone,
  sms: MessageSquare,
  email: Mail,
  ai_call: Bot,
};

const TYPE_COLORS = {
  call: 'bg-blue-100 text-blue-600',
  sms: 'bg-green-100 text-green-600',
  email: 'bg-purple-100 text-purple-600',
  ai_call: 'bg-orange-100 text-orange-600',
};

export function InteractionHistory({ customerId }: InteractionHistoryProps) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadCommunications();
  }, [customerId]);

  const loadCommunications = async () => {
    try {
      const data = await getCustomerCommunications(customerId);
      setCommunications(data);
    } catch (error) {
      console.error('Load communications error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (communications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No interactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => {
        const Icon = ICON_MAP[comm.type];
        const isExpanded = expandedId === comm.id;
        const aiSummary = comm.ai_summary ? JSON.parse(comm.ai_summary) : null;

        return (
          <div
            key={comm.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setExpandedId(isExpanded ? null : comm.id)}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`p-2 rounded-full ${TYPE_COLORS[comm.type]}`}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium capitalize">
                    {comm.type.replace('_', ' ')} • {comm.direction}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comm.created_at), { addSuffix: true })}
                  </div>
                </div>

                {/* Summary or Content */}
                {aiSummary ? (
                  <div className="text-sm text-gray-600">
                    {aiSummary.summary}
                  </div>
                ) : comm.content ? (
                  <div className="text-sm text-gray-600 truncate">
                    {comm.content}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">
                    {comm.duration_seconds ? `${comm.duration_seconds}s call` : 'No content'}
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    {/* Full Content */}
                    {comm.content && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Content</div>
                        <div className="text-sm whitespace-pre-wrap">{comm.content}</div>
                      </div>
                    )}

                    {/* AI Summary Details */}
                    {aiSummary && (
                      <>
                        {aiSummary.keyPoints && aiSummary.keyPoints.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Key Points</div>
                            <ul className="text-sm space-y-1">
                              {aiSummary.keyPoints.map((point: string, i: number) => (
                                <li key={i}>• {point}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiSummary.actionItems && aiSummary.actionItems.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Action Items</div>
                            <ul className="text-sm space-y-1">
                              {aiSummary.actionItems.map((item: string, i: number) => (
                                <li key={i}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiSummary.sentiment && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Sentiment</div>
                            <span className={`text-sm px-2 py-1 rounded ${
                              aiSummary.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                              aiSummary.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {aiSummary.sentiment}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Recording */}
                    {comm.recording_url && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Recording</div>
                        <audio controls className="w-full">
                          <source src={comm.recording_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-gray-500">
                      {comm.created_by_profile && (
                        <span>By: {comm.created_by_profile.name}</span>
                      )}
                      {comm.duration_seconds && (
                        <span className="ml-3">Duration: {comm.duration_seconds}s</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
