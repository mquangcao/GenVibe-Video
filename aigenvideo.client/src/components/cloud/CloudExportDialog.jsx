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
import { CloudUpload, Settings, Video, FileVideo, AlertCircle, CheckCircle, Copy, ExternalLink, Folder, Tag } from 'lucide-react';

export function CloudExportDialog({ isOpen, onClose, onExport, duration, projectId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [result, setResult] = useState(null);

  const [exportSettings, setExportSettings] =
    useState <
    ExportSettings >
    {
      resolution: '1920x1080',
      quality: 'medium',
      format: 'webm',
      fps: 30,
    };

  const [uploadOptions, setUploadOptions] =
    useState <
    UploadOptions >
    {
      folder: 'video-editor',
      tags: ['edited', 'video-editor'],
      publicId: projectId ? `edited-${projectId}` : `edited-${Date.now()}`,
      description: '',
    };

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setExportStatus('');
      setIsExporting(false);
      setResult(null);
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (duration <= 0) {
      alert('No content to export! Please add some media to the timeline.');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setExportStatus('Preparing export...');

    try {
      const uploadResult = await onExport(exportSettings, uploadOptions);

      if (uploadResult) {
        setResult(uploadResult);
        setExportStatus('Successfully saved to cloud!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert('Export failed. Please check the console for details and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedSize = () => {
    const videoSizeMB = duration * (exportSettings.quality === 'high' ? 2.5 : exportSettings.quality === 'medium' ? 1.5 : 0.8);
    const audioSizeMB = duration * 0.1;
    const totalSizeMB = videoSizeMB + audioSizeMB;

    const resolutionMultiplier = exportSettings.resolution === '1920x1080' ? 1 : exportSettings.resolution === '1280x720' ? 0.6 : 0.3;

    return Math.round(totalSizeMB * resolutionMultiplier);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
            <CloudUpload className="w-5 h-5" />
            Export & Save to Cloud
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning for no content */}
          {duration <= 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium">No content to export</div>
                <div>Please add some media files to the timeline before exporting.</div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Successfully Saved to Cloud!</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">{(result.bytes / 1024 / 1024).toFixed(2)} MB</Badge>
                  <Badge variant="outline">{result.format.toUpperCase()}</Badge>
                  {result.duration && <Badge variant="outline">{result.duration.toFixed(1)}s</Badge>}
                </div>

                <div className="bg-white rounded border p-2">
                  <div className="text-xs text-gray-500 mb-1">Cloudinary URL:</div>
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
              </div>
            </div>
          )}

          {/* Video Info */}
          {!result && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4" />
                <span className="font-medium">Export Information</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Duration: {formatTime(duration)}</div>
                <div>Estimated Size: ~{getEstimatedSize()} MB</div>
                <div>
                  Format: {exportSettings.format.toUpperCase()} with {exportSettings.quality} quality
                </div>
              </div>
            </div>
          )}

          {/* Export Settings */}
          {!result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Export Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={exportSettings.format}
                    onValueChange={(value) => setExportSettings((prev) => ({ ...prev, format: value }))}
                    disabled={isExporting}
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
                    value={exportSettings.quality}
                    onValueChange={(value) => setExportSettings((prev) => ({ ...prev, quality: value }))}
                    disabled={isExporting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (5 Mbps)</SelectItem>
                      <SelectItem value="medium">Medium (3 Mbps)</SelectItem>
                      <SelectItem value="low">Low (1.5 Mbps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select
                    value={exportSettings.resolution}
                    onValueChange={(value) => setExportSettings((prev) => ({ ...prev, resolution: value }))}
                    disabled={isExporting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1920x1080">1920×1080 (Full HD)</SelectItem>
                      <SelectItem value="1280x720">1280×720 (HD)</SelectItem>
                      <SelectItem value="854x480">854×480 (SD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fps">Frame Rate</Label>
                  <Select
                    value={exportSettings.fps.toString()}
                    onValueChange={(value) => setExportSettings((prev) => ({ ...prev, fps: Number.parseInt(value) }))}
                    disabled={isExporting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 FPS</SelectItem>
                      <SelectItem value="60">60 FPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Upload Options */}
          {!result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CloudUpload className="w-4 h-4" />
                <span className="font-medium">Cloud Upload Options</span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="publicId" className="flex items-center gap-1">
                    <FileVideo className="w-3 h-3" />
                    Public ID
                  </Label>
                  <Input
                    id="publicId"
                    value={uploadOptions.publicId || ''}
                    onChange={(e) => setUploadOptions((prev) => ({ ...prev, publicId: e.target.value }))}
                    placeholder="e.g., my-edited-video"
                    disabled={isExporting}
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
                    placeholder="e.g., video-editor"
                    disabled={isExporting}
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
                    placeholder="e.g., edited, video-editor, project"
                    disabled={isExporting}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={uploadOptions.description || ''}
                    onChange={(e) => setUploadOptions((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your edited video..."
                    rows={2}
                    disabled={isExporting}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{exportStatus}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-gray-500">This process includes video export and cloud upload...</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isExporting} className="flex-1 bg-transparent">
              {result ? 'Close' : isExporting ? 'Exporting...' : 'Cancel'}
            </Button>
            {!result && (
              <Button onClick={handleExport} disabled={isExporting || duration === 0} className="flex-1">
                {isExporting ? (
                  'Exporting...'
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Export & Upload
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
