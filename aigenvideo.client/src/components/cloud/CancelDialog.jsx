'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, AlertTriangle, RotateCcw, Video } from 'lucide-react';

export function CancelDialog({ isOpen, onClose, onConfirmCancel, hasChanges, baseVideoUrl }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" />
            Cancel Video Editing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning if there are unsaved changes */}
          {hasChanges && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> You have unsaved changes that will be lost if you cancel.
              </AlertDescription>
            </Alert>
          )}

          {/* Info about what will happen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-gray-600" />
              <span className="font-medium">What happens when you cancel:</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 ml-6">
              <li>• All edits will be discarded</li>
              <li>• Timeline will be cleared</li>
              <li>• You'll return to the original video</li>
              {!hasChanges && <li>• No changes will be lost (no edits made)</li>}
            </ul>
          </div>

          {/* Original video info */}
          {baseVideoUrl && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Original Video</span>
              </div>
              <div className="text-sm text-blue-700 truncate">{baseVideoUrl}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={onConfirmCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              {hasChanges ? 'Discard Changes' : 'Cancel'}
            </Button>
          </div>

          {/* Additional info */}
          <div className="text-xs text-gray-500 text-center">
            {hasChanges
              ? 'Make sure to save your changes before canceling if you want to keep them.'
              : 'You can always start editing again later.'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
