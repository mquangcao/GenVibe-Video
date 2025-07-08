'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, Settings, Video, FileVideo, AlertCircle, Volume2, Clock } from 'lucide-react';

export function ExportDialog({ isOpen, onClose, onExport, duration }) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [settings, setSettings] = useState({
    resolution: '1920x1080',
    quality: 'medium',
    format: 'webm',
    fps: 30,
  });

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setExportStatus('');
      setIsExporting(false);
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (duration <= 0) {
      alert('No content to export! Please add some media to the timeline.');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setExportStatus('Initializing audio mixer...');

    try {
      await onExport(settings, (progressValue) => {
        setProgress(progressValue);
        if (progressValue < 10) {
          setExportStatus('Setting up audio capture...');
        } else if (progressValue < 20) {
          setExportStatus('Loading media with audio...');
        } else {
          setExportStatus(`Rendering video with audio... ${Math.round(progressValue)}%`);
        }
      });

      setExportStatus('Export with audio completed successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
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
    // Include audio in size calculation
    const videoSizeMB = duration * (settings.quality === 'high' ? 2.5 : settings.quality === 'medium' ? 1.5 : 0.8);
    const audioSizeMB = duration * 0.1; // ~128kbps audio
    const totalSizeMB = videoSizeMB + audioSizeMB;

    const resolutionMultiplier = settings.resolution === '1920x1080' ? 1 : settings.resolution === '1280x720' ? 0.6 : 0.3;

    return Math.round(totalSizeMB * resolutionMultiplier);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="w-5 h-5" />
            Export Video with Audio
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

          {/* Audio Support Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <Volume2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <div className="font-medium">Audio Support Enabled</div>
              <div>Video will be exported with synchronized audio from your media files.</div>
            </div>
          </div>

          {/* Video Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4" />
              <span className="font-medium">Export Information</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Duration: {formatTime(duration)}
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3 h-3" />
                Audio: 128 kbps stereo
              </div>
              <div>Estimated Size: ~{getEstimatedSize()} MB</div>
              <div>
                Format: {settings.format.toUpperCase()} with {settings.quality} quality
              </div>
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Export Settings</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, format: value }))}
                  disabled={isExporting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webm">WebM + Audio</SelectItem>
                    <SelectItem value="mp4" disabled>
                      MP4 + Audio (Coming Soon)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quality">Quality</Label>
                <Select
                  value={settings.quality}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, quality: value }))}
                  disabled={isExporting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (5 Mbps + Audio)</SelectItem>
                    <SelectItem value="medium">Medium (3 Mbps + Audio)</SelectItem>
                    <SelectItem value="low">Low (1.5 Mbps + Audio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Select
                  value={settings.resolution}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, resolution: value }))}
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
                  value={settings.fps.toString()}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, fps: Number.parseInt(value) }))}
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

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{exportStatus}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-gray-500">Exporting video with synchronized audio. This may take a few minutes...</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isExporting} className="flex-1 bg-transparent">
              {isExporting ? 'Exporting...' : 'Cancel'}
            </Button>
            <Button onClick={handleExport} disabled={isExporting || duration === 0} className="flex-1">
              {isExporting ? (
                'Exporting...'
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export with Audio
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
