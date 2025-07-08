'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, X, Upload, Undo, Redo, Play, Pause, Settings, FolderOpen, CloudUpload, RotateCcw } from 'lucide-react';

export function Header({ isPlaying, onPlayPause, onImport, onSaveChanges, onCancel, onSave, hasChanges = false, isProcessing = false }) {
  console.log('🔘 Header render - hasChanges:', hasChanges, 'isProcessing:', isProcessing);

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">VE</span>
        </div>
        <span className="font-bold text-lg text-gray-800">VideoEditor</span>
        {hasChanges && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Unsaved changes" />}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* File Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onImport} className="gap-2">
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          Open
        </Button>
        <Button variant="ghost" size="sm" onClick={onSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Project
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Edit Operations */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        <Button variant={isPlaying ? 'default' : 'outline'} size="sm" onClick={onPlayPause} className="gap-2">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Save/Cancel Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="gap-2 text-gray-600 hover:text-red-600 hover:border-red-300 bg-transparent"
          >
            {isProcessing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Cancel
          </Button>

          <Button
            onClick={onSaveChanges}
            disabled={isProcessing || !hasChanges}
            className={`gap-2 transition-all duration-200 ${
              hasChanges && !isProcessing
                ? 'bg-green-600 text-white hover:bg-green-700 border-green-600 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
            }`}
            title={hasChanges ? 'Save your changes to cloud' : 'No changes to save'}
          >
            {isProcessing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                Save Changes {hasChanges && <span className="ml-1">●</span>}
              </>
            )}
          </Button>
        </div>

        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
