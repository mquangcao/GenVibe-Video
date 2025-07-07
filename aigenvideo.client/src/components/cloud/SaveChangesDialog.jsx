'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CloudUpload, Settings, Video, CheckCircle, AlertCircle, Copy, ExternalLink, Folder, Tag, Save, Clock } from 'lucide-react';

export function SaveChangesDialog({ isOpen, onClose, onSaveChanges, duration, projectId, baseVideoUrl, hasChanges }) {
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [result, setResult] = useState(null);

  const [saveSettings, setSaveSettings] = useState({
    quality: 'medium',
    format: 'webm',
    keepOriginal: true,
  });

  const [uploadOptions, setUploadOptions] = useState({
    folder: 'video-editor/edited',
    tags: ['edited', 'video-editor', 'updated'],
    publicId: projectId ? `${projectId}-edited-${Date.now()}` : `edited-${Date.now()}`,
    description: 'Edited video with changes applied',
  });

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setSaveStatus('');
      setIsSaving(false);
      setResult(null);
    }
  }, [isOpen]);

  const handleSaveChanges = async () => {
    if (duration <= 0 || !hasChanges) {
      alert('No changes to save!');
      return;
    }

    setIsSaving(true);
    setProgress(0);
    setSaveStatus('Preparing to save changes...');

    try {
      console.log('quang check check', saveSettings, uploadOptions);
      const uploadResult = await onSaveChanges(saveSettings, uploadOptions);

      if (uploadResult) {
        setResult(uploadResult);
        setSaveStatus('Changes saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedSize = () => {
    const videoSizeMB = duration * (saveSettings.quality === 'high' ? 2.5 : saveSettings.quality === 'medium' ? 1.5 : 0.8);
    const audioSizeMB = duration * 0.1;
    return Math.round(videoSizeMB + audioSizeMB);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleTagsChange = (value) => {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    setUploadOptions((prev) => ({ ...prev, tags }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Video Changes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* No Changes Warning */}
          {!hasChanges && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No changes detected. Make some edits to the video before saving.</AlertDescription>
            </Alert>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Changes Saved Successfully!</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">{(result.bytes / 1024 / 1024).toFixed(2)} MB</Badge>
                  <Badge variant="outline">{result.format.toUpperCase()}</Badge>
                  {result.duration && <Badge variant="outline">{result.duration.toFixed(1)}s</Badge>}
                </div>

                <div className="bg-white rounded border p-2">
                  <div className="text-xs text-gray-500 mb-1">Updated Video URL:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={result.secure_url}
                      readOnly
                      className="flex-1 text-xs bg-transparent border-none outline-none"
                    />
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.secure_url)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => window.open(result.secure_url, '_blank')}>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {saveSettings.keepOriginal && baseVideoUrl && (
                  <div className="bg-blue-50 rounded border p-2">
                    <div className="text-xs text-blue-600 mb-1">Original Video (preserved):</div>
                    <div className="text-xs text-blue-800 truncate">{baseVideoUrl}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Info */}
          {!result && hasChanges && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4" />
                <span className="font-medium">Video Information</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Duration: {formatTime(duration)}
                </div>
                <div>Estimated Size: ~{getEstimatedSize()} MB</div>
                <div>
                  Format: {saveSettings.format.toUpperCase()} with {saveSettings.quality} quality
                </div>
                <div className="text-green-600 font-medium">✓ Changes detected - ready to save</div>
              </div>
            </div>
          )}

          {/* Save Settings */}
          {!result && hasChanges && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Save Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={saveSettings.format}
                    onValueChange={(value) => setSaveSettings((prev) => ({ ...prev, format: value }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webm">WebM (Recommended)</SelectItem>
                      <SelectItem value="mp4">MP4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality">Quality</Label>
                  <Select
                    value={saveSettings.quality}
                    onValueChange={(value) => setSaveSettings((prev) => ({ ...prev, quality: value }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Quality</SelectItem>
                      <SelectItem value="medium">Medium Quality</SelectItem>
                      <SelectItem value="low">Low Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="keepOriginal"
                  checked={saveSettings.keepOriginal}
                  onChange={(e) => setSaveSettings((prev) => ({ ...prev, keepOriginal: e.target.checked }))}
                  disabled={isSaving}
                />
                <Label htmlFor="keepOriginal" className="text-sm">
                  Keep original video (recommended)
                </Label>
              </div>
            </div>
          )}

          {/* Upload Options */}
          {!result && hasChanges && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CloudUpload className="w-4 h-4" />
                <span className="font-medium">Cloud Storage Options</span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="publicId" className="flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    File Name
                  </Label>
                  <Input
                    id="publicId"
                    value={uploadOptions.publicId || ''}
                    onChange={(e) => setUploadOptions((prev) => ({ ...prev, publicId: e.target.value }))}
                    placeholder="e.g., my-edited-video"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <Label htmlFor="folder" className="flex items-center gap-1">
                    <Folder className="w-3 h-3" />
                    Folder
                  </Label>
                  <Input
                    id="folder"
                    value={uploadOptions.folder || ''}
                    onChange={(e) => setUploadOptions((prev) => ({ ...prev, folder: e.target.value }))}
                    placeholder="e.g., video-editor/edited"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <Label htmlFor="tags" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    value={uploadOptions.tags?.join(', ') || ''}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="e.g., edited, updated, final"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadOptions.description || ''}
                    onChange={(e) => setUploadOptions((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the changes made to this video..."
                    rows={2}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {isSaving && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{saveStatus}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-gray-500">Saving your changes to the cloud...</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="flex-1 bg-transparent">
              {result ? 'Close' : isSaving ? 'Saving...' : 'Cancel'}
            </Button>
            {!result && (
              <Button onClick={handleSaveChanges} disabled={isSaving || !hasChanges} className="flex-1">
                {isSaving ? (
                  'Saving Changes...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
