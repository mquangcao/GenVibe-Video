'use client';

import React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, Video, ImageIcon, Music, Play } from 'lucide-react';

export function MediaLibrary({ mediaItems, onAddMedia, onDragStart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        await onAddMedia(file);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredMedia = mediaItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const videoItems = filteredMedia.filter((item) => item.type === 'video');
  const imageItems = filteredMedia.filter((item) => item.type === 'image');
  const audioItems = filteredMedia.filter((item) => item.type === 'audio');

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex gap-2 mb-3">
          <Button size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="w-4 h-4 mr-1" />
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </Button>
          <input ref={fileInputRef} type="file" multiple accept="video/*,image/*,audio/*" className="hidden" onChange={handleFileUpload} />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search media..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 m-2">
          <TabsTrigger value="all">All ({filteredMedia.length})</TabsTrigger>
          <TabsTrigger value="video">Video ({videoItems.length})</TabsTrigger>
          <TabsTrigger value="image">Image ({imageItems.length})</TabsTrigger>
          <TabsTrigger value="audio">Audio ({audioItems.length})</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-2">
          <TabsContent value="all" className="mt-0">
            <MediaGrid items={filteredMedia} onDragStart={onDragStart} />
          </TabsContent>
          <TabsContent value="video" className="mt-0">
            <MediaGrid items={videoItems} onDragStart={onDragStart} />
          </TabsContent>
          <TabsContent value="image" className="mt-0">
            <MediaGrid items={imageItems} onDragStart={onDragStart} />
          </TabsContent>
          <TabsContent value="audio" className="mt-0">
            <MediaGrid items={audioItems} onDragStart={onDragStart} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 border-t text-xs text-blue-700">💡 Drag media files to timeline tracks below to start editing</div>
    </div>
  );
}

function MediaGrid({ items, onDragStart }) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(itemId);

    // Add visual feedback
    const target = e.target;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    const target = e.target;
    target.style.opacity = '1';
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg p-2 cursor-grab hover:cursor-grabbing hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-200"
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragEnd={handleDragEnd}
        >
          <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden relative">
            {item.type === 'video' && item.thumbnail ? (
              <img src={item.thumbnail || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
            ) : item.type === 'image' ? (
              <img src={item.url || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
            ) : item.type === 'video' ? (
              <Video className="w-6 h-6 text-gray-400" />
            ) : item.type === 'audio' ? (
              <Music className="w-6 h-6 text-gray-400" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}

            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
                <Play className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Drag indicator */}
            <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100">Drag</div>
          </div>

          <div className="text-xs font-medium truncate" title={item.name}>
            {item.name}
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatDuration(item.duration)}</span>
            {item.width && item.height && (
              <span>
                {item.width}x{item.height}
              </span>
            )}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="col-span-2 text-center py-8 text-gray-400">
          <Upload className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No media files yet</p>
          <p className="text-xs">Upload some files to get started</p>
        </div>
      )}
    </div>
  );
}
