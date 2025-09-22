'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useCallback, memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const MemoizedQRCodeSVG = memo(QRCodeSVG);

interface SharePollCardProps {
  pollQuestion: string;
  shareUrl: string;
}

export function SharePollCard({ pollQuestion, shareUrl }: SharePollCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Share Poll: {pollQuestion}</CardTitle>
        <CardDescription>Share this link or QR code for others to vote.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="w-full flex items-center space-x-2">
          <Input value={shareUrl} readOnly aria-label="Poll share URL" />
          <Button onClick={handleCopy} aria-live="polite">{copied ? 'Copied!' : 'Copy'}</Button>
        </div>
        {shareUrl && (
          <div className="p-4 border border-gray-200 rounded-md">
            <MemoizedQRCodeSVG value={shareUrl} size={256} level="H" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}