'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Type, Sticker, Palette, Volume2, Zap, Filter, Trash2, Music, Mic } from 'lucide-react';

export function ToolsPanel({
  onAddText,
  onAddSticker,
  onUpdateText,
  onUpdateSticker,
  onDeleteSelected,
  currentTime,
  selectedItem,
  editorState,
}) {
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState([32]);
  const [textColor, setTextColor] = useState('#ffffff');
  const [stickerSize, setStickerSize] = useState([64]);

  const handleAddText = () => {
    if (!textInput.trim()) return;

    const textElement = {
      id: `text-${Date.now()}`,
      text: textInput,
      x: 320,
      y: 180,
      fontSize: fontSize[0],
      color: textColor,
      fontFamily: 'Arial',
      startTime: currentTime,
      endTime: currentTime + 5,
      rotation: 0,
      opacity: 1,
    };

    onAddText(textElement);
    setTextInput('');
  };

  const handleAddSticker = (emoji) => {
    const sticker = {
      id: `sticker-${Date.now()}`,
      emoji,
      x: 320,
      y: 180,
      size: stickerSize[0],
      startTime: currentTime,
      endTime: currentTime + 5,
      rotation: 0,
      opacity: 1,
    };

    onAddSticker(sticker);
  };

  const stickerCategories = {
    faces: ['😀', '😂', '🥰', '😎', '🤔', '😴', '🤯', '🥳'],
    hands: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '👏', '🙌'],
    hearts: ['❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '💖'],
    symbols: ['⭐', '🔥', '💯', '✨', '🎉', '🎊', '💥', '⚡'],
  };

  const effects = [
    { name: 'Blur', icon: Filter, description: 'Add blur effect' },
    { name: 'Brightness', icon: Zap, description: 'Adjust brightness' },
    { name: 'Contrast', icon: Palette, description: 'Adjust contrast' },
    { name: 'Saturation', icon: Palette, description: 'Adjust saturation' },
    { name: 'Vintage', icon: Filter, description: 'Vintage filter' },
    { name: 'Black & White', icon: Filter, description: 'Grayscale filter' },
  ];

  // Tìm selected element
  const selectedText = editorState.textElements.find((t) => t.id === selectedItem);
  const selectedSticker = editorState.stickerElements.find((s) => s.id === selectedItem);

  return (
    <div className="w-80 border-l bg-gray-50 flex flex-col h-full">
      {/* Header - FIXED */}
      <div className="p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Tools</h3>
          {selectedItem && (
            <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="text" className="flex flex-col h-full">
          {/* Tabs List - STICKY */}
          <div className="sticky top-0 bg-gray-50 z-10">
            <TabsList className="grid w-full grid-cols-4 m-2">
              <TabsTrigger value="text">
                <Type className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="stickers">
                <Sticker className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="effects">
                <Filter className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="audio">
                <Volume2 className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - SCROLLABLE */}
          <div className="p-4">
            <TabsContent value="text" className="mt-0 space-y-4">
              <div>
                <Label htmlFor="text-input">Text Content</Label>
                <Input
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter your text..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Font Size: {fontSize[0]}px</Label>
                <Slider value={fontSize} onValueChange={setFontSize} min={12} max={120} step={1} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="text-color">Text Color</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 mt-1"
                />
              </div>

              <Button onClick={handleAddText} className="w-full" disabled={!textInput.trim()}>
                Add Text
              </Button>

              <div className="space-y-2">
                <Label>Text Presets</Label>
                <div className="grid grid-cols-1 gap-2">
                  {['Title', 'Subtitle', 'Caption'].map((preset) => (
                    <Button key={preset} variant="outline" size="sm" onClick={() => setTextInput(preset)} className="bg-transparent">
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stickers" className="mt-0 space-y-4">
              <div>
                <Label>Sticker Size: {stickerSize[0]}px</Label>
                <Slider value={stickerSize} onValueChange={setStickerSize} min={24} max={120} step={4} className="mt-2" />
              </div>

              {Object.entries(stickerCategories).map(([category, emojis]) => (
                <div key={category}>
                  <Label className="capitalize">{category}</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {emojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="aspect-square text-2xl bg-white hover:bg-gray-50 p-0"
                        onClick={() => handleAddSticker(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="effects" className="mt-0 space-y-2">
              {effects.map((effect) => (
                <Button key={effect.name} variant="outline" className="w-full justify-start bg-white hover:bg-gray-50">
                  <effect.icon className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{effect.name}</div>
                    <div className="text-xs text-gray-500">{effect.description}</div>
                  </div>
                </Button>
              ))}
            </TabsContent>

            <TabsContent value="audio" className="mt-0 space-y-4">
              <div>
                <Label>Master Volume</Label>
                <Slider defaultValue={[80]} min={0} max={100} step={1} className="mt-2" />
              </div>

              <Button variant="outline" className="w-full bg-white hover:bg-gray-50">
                <Music className="w-4 h-4 mr-2" />
                Add Background Music
              </Button>

              <Button variant="outline" className="w-full bg-white hover:bg-gray-50">
                <Mic className="w-4 h-4 mr-2" />
                Record Voiceover
              </Button>

              <div className="space-y-2">
                <Label>Audio Effects</Label>
                {['Echo', 'Reverb', 'Bass Boost', 'Treble Boost'].map((effect) => (
                  <Button key={effect} variant="outline" size="sm" className="w-full bg-white hover:bg-gray-50">
                    {effect}
                  </Button>
                ))}
              </div>
            </TabsContent>

            {/* EDIT PANELS - TRONG SCROLLABLE AREA */}
            {selectedText && (
              <div className="mt-6 border-t pt-4 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Edit Text
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label>Text Content</Label>
                    <Input
                      value={selectedText.text}
                      onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Font Size: {selectedText.fontSize}px</Label>
                    <Slider
                      value={[selectedText.fontSize]}
                      onValueChange={([value]) => onUpdateText(selectedText.id, { fontSize: value })}
                      min={12}
                      max={120}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input
                      type="color"
                      value={selectedText.color}
                      onChange={(e) => onUpdateText(selectedText.id, { color: e.target.value })}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label>Opacity: {Math.round(selectedText.opacity * 100)}%</Label>
                    <Slider
                      value={[selectedText.opacity]}
                      onValueChange={([value]) => onUpdateText(selectedText.id, { opacity: value })}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedSticker && (
              <div className="mt-6 border-t pt-4 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="text-lg">{selectedSticker.emoji}</span>
                  Edit Sticker
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label>Size: {selectedSticker.size}px</Label>
                    <Slider
                      value={[selectedSticker.size]}
                      onValueChange={([value]) => onUpdateSticker(selectedSticker.id, { size: value })}
                      min={24}
                      max={200}
                      step={4}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Opacity: {Math.round(selectedSticker.opacity * 100)}%</Label>
                    <Slider
                      value={[selectedSticker.opacity]}
                      onValueChange={([value]) => onUpdateSticker(selectedSticker.id, { opacity: value })}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Rotation: {selectedSticker.rotation}°</Label>
                    <Slider
                      value={[selectedSticker.rotation]}
                      onValueChange={([value]) => onUpdateSticker(selectedSticker.id, { rotation: value })}
                      min={0}
                      max={360}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
