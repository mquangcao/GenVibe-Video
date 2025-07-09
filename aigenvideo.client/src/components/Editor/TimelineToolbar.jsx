'use client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Scissors, Copy, Trash2, MousePointer, Move, RotateCcw, RotateCw } from 'lucide-react';

export function TimelineToolbar({ selectedTool, onToolChange, selectedItem, onCut, onDuplicate, onDelete, onUndo, onRedo }) {
  return (
    <div className="h-10 bg-gray-100 border-b flex items-center px-3 gap-2">
      {/* Tool Selection */}
      <div className="flex items-center gap-1">
        <Button variant={selectedTool === 'select' ? 'default' : 'ghost'} size="sm" onClick={() => onToolChange('select')} className="h-8">
          <MousePointer className="w-4 h-4" />
        </Button>
        <Button variant={selectedTool === 'cut' ? 'default' : 'ghost'} size="sm" onClick={() => onToolChange('cut')} className="h-8">
          <Scissors className="w-4 h-4" />
        </Button>
        <Button variant={selectedTool === 'move' ? 'default' : 'ghost'} size="sm" onClick={() => onToolChange('move')} className="h-8">
          <Move className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Edit Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onUndo} className="h-8">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onRedo} className="h-8">
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Item Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onCut} disabled={!selectedItem} className="h-8" title="Cut at playhead (C)">
          <Scissors className="w-4 h-4" />
          Cut
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate} disabled={!selectedItem} className="h-8" title="Duplicate (Ctrl+D)">
          <Copy className="w-4 h-4" />
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={!selectedItem}
          className="h-8 text-red-600 hover:text-red-700"
          title="Delete (Del)"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      <div className="flex-1" />

      {/* Status */}
      <div className="text-xs text-gray-500">
        {selectedTool === 'cut' && 'Click on timeline items to cut at playhead'}
        {selectedTool === 'move' && 'Drag timeline items to move them'}
        {selectedTool === 'select' && selectedItem && 'Item selected - use tools above'}
        {selectedTool === 'select' && !selectedItem && 'Select an item to edit'}
      </div>
    </div>
  );
}
