'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudUpload, CloudDownload, CheckCircle, AlertCircle, Loader2, Copy, ExternalLink } from 'lucide-react';

export function CloudStatus({ cloudState, onRetry, onCopyUrl }) {
  const { isLoading, isUploading, uploadProgress, baseVideo, lastSavedUrl, error } = cloudState;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (onCopyUrl) {
      onCopyUrl(text);
    }
  };

  return (
    <div className="space-y-3">
      {/* Base Video Status */}
      {baseVideo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CloudDownload className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Base Video Loaded</span>
            <Badge variant="secondary" className="text-xs">
              {baseVideo.duration.toFixed(1)}s
            </Badge>
          </div>
          <div className="text-sm text-blue-700 truncate">ID: {baseVideo.publicId}</div>
        </div>
      )}

      {/* Loading Status */}
      {isLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading base video from cloud...</AlertDescription>
        </Alert>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CloudUpload className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-900">Uploading to Cloud</span>
            <Badge variant="outline" className="text-xs">
              {uploadProgress}%
            </Badge>
          </div>
          <Progress value={uploadProgress} className="w-full h-2" />
          <div className="text-sm text-green-700 mt-1">{uploadProgress < 80 ? 'Exporting video...' : 'Uploading to Cloudinary...'}</div>
        </div>
      )}

      {/* Success Status */}
      {lastSavedUrl && !isUploading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-900">Saved to Cloud</span>
            <Badge className="bg-green-600 text-white text-xs">Ready</Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="text" value={lastSavedUrl} readOnly className="flex-1 text-sm bg-white border rounded px-2 py-1 text-gray-700" />
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(lastSavedUrl)} className="flex items-center gap-1">
              <Copy className="w-3 h-3" />
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(lastSavedUrl, '_blank')} className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              View
            </Button>
          </div>
        </div>
      )}

      {/* Error Status */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Cloud Info */}
      {!baseVideo && !isLoading && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Cloud className="w-4 h-4" />
            <span className="text-sm">Ready for cloud-based editing</span>
          </div>
        </div>
      )}
    </div>
  );
}
