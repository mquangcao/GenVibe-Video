'use client';

import React from 'react';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/common';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Youtube,
  Music2,
  Facebook,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Upload,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  BarChart3,
  Settings,
  ArrowLeft,
  Link2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AnalyticsDialog from './AnalyticsDialog';

// interface PlatformStatus {
//   platform: "youtube" | "tiktok" | "facebook"
//   platformName: string
//   icon: React.ReactNode
//   color: string
//   bgColor: string
//   uploaded: boolean
//   connected: boolean
//   uploading?: boolean
//   url?: string
//   title?: string
//   description?: string
//   stats?: {
//     views: string
//     likes: string
//     comments: string
//     shares?: string
//   }
//   uploadDate?: string
//   monthlyStats?: {
//     month: string
//     views: number
//     likes: number
//     comments: number
//     shares: number
//   }[]
// }

export default function SocialVideoManagementPage() {
  const [videoData, setVideoData] = useState({
    title: 'How to Build a Modern React App in 2024',
    description: 'Complete tutorial covering Next.js, TypeScript, and modern development practices',
    thumbnail: 'https://placehold.co/200x350',
    duration: '15:42',
    createdDate: 'Dec 18, 2024',
    totalViews: '45.2K',
    totalLikes: '2.1K',
    totalComments: '156',
  });

  const [platforms, setPlatforms] = useState([
    {
      platform: 'youtube',
      platformName: 'YouTube',
      icon: <Icons.Youtube className="w-10 h-10" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      uploaded: true,
      connected: true,
      url: 'https://youtube.com/watch?v=abc123',
      title: 'How to Build a Modern React App in 2024 - Complete Guide',
      description:
        'Complete tutorial covering Next.js, TypeScript, and modern development practices. Perfect for beginners and intermediate developers.',
      stats: {
        views: '32.1K',
        likes: '1.8K',
        comments: '124',
        shares: '89',
      },
      uploadDate: 'Dec 18, 2024',
      monthlyStats: [
        { month: 'Oct', views: 8500, likes: 420, comments: 32, shares: 18 },
        { month: 'Nov', views: 12300, likes: 680, comments: 45, shares: 28 },
        { month: 'Dec', views: 11300, likes: 700, comments: 47, shares: 43 },
      ],
    },
    {
      platform: 'tiktok',
      platformName: 'TikTok',
      icon: <Icons.Tiktok className="w-10 h-10" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      uploaded: false,
      connected: false,
    },
    {
      platform: 'facebook',
      platformName: 'Facebook',
      icon: <Icons.Facebook className="w-10 h-10" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      uploaded: true,
      connected: true,
      url: 'https://facebook.com/video/123',
      title: 'Modern React Development Tutorial 2024',
      description: 'Learn how to build modern React applications with the latest tools and best practices.',
      stats: {
        views: '8.9K',
        likes: '245',
        comments: '28',
        shares: '67',
      },
      uploadDate: 'Dec 18, 2024',
      monthlyStats: [
        { month: 'Oct', views: 2100, likes: 85, comments: 8, shares: 15 },
        { month: 'Nov', views: 3200, likes: 120, comments: 12, shares: 22 },
        { month: 'Dec', views: 3600, likes: 140, comments: 18, shares: 30 },
      ],
    },
  ]);

  const [editingPlatform, setEditingPlatform] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoEditForm, setVideoEditForm] = useState({ title: '', description: '' });
  const [uploadingPlatform, setUploadingPlatform] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '' });

  const handleUploadClick = (platform) => {
    setUploadForm({
      title: videoData.title,
      description: videoData.description,
    });
    setUploadingPlatform(platform);
  };

  const handleConfirmUpload = () => {
    if (uploadingPlatform) {
      // Close popup immediately to prevent spam
      setUploadingPlatform(null);

      setPlatforms((prev) =>
        prev.map((p) =>
          p.platform === uploadingPlatform
            ? {
                ...p,
                uploading: true,
              }
            : p
        )
      );

      setTimeout(() => {
        setPlatforms((prev) =>
          prev.map((p) =>
            p.platform === uploadingPlatform
              ? {
                  ...p,
                  uploading: false,
                  uploaded: true,
                  url: `https://${uploadingPlatform}.com/video/new123`,
                  title: uploadForm.title,
                  description: uploadForm.description,
                  stats: {
                    views: '0',
                    likes: '0',
                    comments: '0',
                    shares: '0',
                  },
                  uploadDate: new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                  monthlyStats: [{ month: 'Dec', views: 0, likes: 0, comments: 0, shares: 0 }],
                }
              : p
          )
        );
      }, 2000);
    }
  };

  const handleDelete = (platform) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.platform === platform
          ? {
              ...p,
              uploaded: false,
              uploading: false,
              url: undefined,
              title: undefined,
              description: undefined,
              stats: undefined,
              uploadDate: undefined,
              monthlyStats: undefined,
            }
          : p
      )
    );
  };

  const handleEdit = (platform) => {
    const platformData = platforms.find((p) => p.platform === platform);
    if (platformData) {
      setEditForm({
        title: platformData.title || '',
        description: platformData.description || '',
      });
      setEditingPlatform(platform);
    }
  };

  const handleSaveEdit = () => {
    if (editingPlatform) {
      setPlatforms((prev) =>
        prev.map((p) =>
          p.platform === editingPlatform
            ? {
                ...p,
                title: editForm.title,
                description: editForm.description,
              }
            : p
        )
      );
      setEditingPlatform(null);
    }
  };

  const handleVideoEdit = () => {
    setVideoEditForm({
      title: videoData.title,
      description: videoData.description,
    });
    setEditingVideo(true);
  };

  const handleSaveVideoEdit = () => {
    setVideoData((prev) => ({
      ...prev,
      title: videoEditForm.title,
      description: videoEditForm.description,
    }));
    setEditingVideo(false);
  };

  // Line Chart component for analytics
  const LineChart = ({ data, type, color = '#3b82f6' }) => {
    const maxValue = Math.max(...data.map((d) => d[type]));
    const minValue = Math.min(...data.map((d) => d[type]));
    const range = maxValue - minValue || 1;

    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 300;
        const y = 80 - ((item[type] - minValue) / range) * 60;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700 capitalize">{type} Over Time</h4>
        <div className="relative">
          <svg width="300" height="100" className="w-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="60" height="20" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Line */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
              className="drop-shadow-sm"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
            />

            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 80 - ((item[type] - minValue) / range) * 60;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  className="drop-shadow-sm"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
                />
              );
            })}
          </svg>

          {/* Labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            {data.map((item, index) => (
              <span key={index}>{item.month}</span>
            ))}
          </div>
        </div>
        <div className="text-center">
          <span className="text-lg font-semibold text-slate-900">{data[data.length - 1][type].toLocaleString()}</span>
          <span className="text-xs text-slate-500 ml-1">latest</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => window.history.back()} className="flex items-center space-x-2 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Videos</span>
        </Button>
        <div className="text-sm text-slate-500">Video Management</div>
      </div>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Video Info Section */}
        <Card className="border-0 shadow-sm !py-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Video Thumbnail */}
              <div className="relative" onClick={() => console.log('Play video')}>
                <img
                  src={videoData.thumbnail || '/placeholder.svg'}
                  alt={videoData.title}
                  className="w-full lg:w-80 h-48 object-cover rounded-lg"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {videoData.duration}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-slate-700 ml-1" />
                  </div>
                </div>
              </div>

              {/* Video Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{videoData.title}</h1>
                    <p className="text-slate-600">{videoData.description}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleVideoEdit} className={'!border !border-gray-300'}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Video
                  </Button>
                </div>

                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {videoData.createdDate}</span>
                  </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-slate-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-lg font-semibold">{videoData.totalViews}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Total Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-slate-600">
                      <Heart className="w-4 h-4" />
                      <span className="text-lg font-semibold">{videoData.totalLikes}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Total Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-slate-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-lg font-semibold">{videoData.totalComments}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Total Comments</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Status Section */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Platform Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch  ">
            {platforms.map((platform) => (
              <Card key={platform.platform} className="border-0 shadow-sm !py-0 ">
                <CardHeader className={`${platform.bgColor} p-4 -mb-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-0 rounded-lg shadow-sm ${platform.color}`}>{platform.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{platform.platformName}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {platform.uploaded ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{platform.connected ? 'Not uploaded' : 'Not connected'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {platform.uploaded ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {platform.connected ? 'Pending' : 'Disconnected'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-3 flex flex-col min-h-[400px]">
                  {platform.uploaded && platform.stats ? (
                    /* Uploaded State */
                    <div className="flex flex-col h-full">
                      <div className="flex-1 space-y-4">
                        {/* Platform Title & Description */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Title on {platform.platformName}:</p>
                            <p className="text-sm font-medium text-slate-900 line-clamp-2">{platform.title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Description:</p>
                            <p className="text-xs text-slate-600 line-clamp-2">{platform.description}</p>
                          </div>
                        </div>

                        {/* Platform Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-center space-x-1 text-slate-600">
                              <Eye className="w-3 h-3" />
                              <span className="text-sm font-semibold">{platform.stats.views}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Views</p>
                          </div>
                          <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-center space-x-1 text-slate-600">
                              <Heart className="w-3 h-3" />
                              <span className="text-sm font-semibold">{platform.stats.likes}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Likes</p>
                          </div>
                          <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-center space-x-1 text-slate-600">
                              <MessageCircle className="w-3 h-3" />
                              <span className="text-sm font-semibold">{platform.stats.comments}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Comments</p>
                          </div>
                          {platform.stats.shares && (
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <div className="flex items-center justify-center space-x-1 text-slate-600">
                                <Share2 className="w-3 h-3" />
                                <span className="text-sm font-semibold">{platform.stats.shares}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Shares</p>
                            </div>
                          )}
                        </div>

                        {/* Upload Info */}
                      </div>
                      {platform.uploadDate && (
                        <div className="text-xs text-slate-500 flex items-center space-x-1 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>Uploaded: {platform.uploadDate}</span>
                        </div>
                      )}
                      {/* Analytics Button */}
                      {platform.monthlyStats && <AnalyticsDialog />}

                      {/* Actions - Fixed at bottom */}
                      <div className="grid grid-cols-3 gap-2 mt-auto pt-4">
                        {platform.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={platform.url} target="_blank" rel="noopener noreferrer" className="!border !border-gray-300">
                              <ExternalLink className="w-3 h-3 mr-1 " />
                              View
                            </a>
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(platform.platform)}
                              className="!border !border-gray-300"
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit {platform.platformName} Content</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  placeholder="Enter title"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  placeholder="Enter description"
                                  rows={3}
                                />
                              </div>
                              <Button onClick={handleSaveEdit} className="w-full">
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(platform.platform)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 !border !border-red-200"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : platform.connected ? (
                    /* Connected but Not Uploaded State */
                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex flex-col justify-center text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-2">Not uploaded to {platform.platformName}</h3>
                        <p className="text-sm text-slate-600 mb-4">Upload this video to reach your {platform.platformName} audience</p>
                      </div>
                      <div className="mt-auto">
                        <Button onClick={() => handleUploadClick(platform.platform)} disabled={platform.uploading} className="w-full">
                          {platform.uploading ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload to {platform.platformName}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Not Connected State */
                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex flex-col justify-center text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Link2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-2">{platform.platformName} not connected</h3>
                        <p className="text-sm text-slate-600 mb-4">Connect your {platform.platformName} account to upload videos</p>
                      </div>
                      <div className="mt-auto space-y-2">
                        <Link
                          to={'/account/platform-connections'}
                          className="w-full flex items-center justify-center bg-black text-white hover:bg-blue-100 hover:text-blue-700 rounded-lg px-4 py-2"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Connect {platform.platformName}
                        </Link>
                        <p className="text-xs text-slate-500 text-center">You'll be redirected to the connections page</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upload Dialog */}
        <Dialog open={uploadingPlatform !== null} onOpenChange={() => setUploadingPlatform(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload to {platforms.find((p) => p.platform === uploadingPlatform)?.platformName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Enter title for this platform"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter description for this platform"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleConfirmUpload} className="flex-1">
                  Confirm Upload
                </Button>
                <Button variant="outline" onClick={() => setUploadingPlatform(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Edit Dialog */}
        <Dialog open={editingVideo} onOpenChange={setEditingVideo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Video Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Video Title</label>
                <Input
                  value={videoEditForm.title}
                  onChange={(e) => setVideoEditForm({ ...videoEditForm, title: e.target.value })}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Video Description</label>
                <Textarea
                  value={videoEditForm.description}
                  onChange={(e) => setVideoEditForm({ ...videoEditForm, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={4}
                />
              </div>
              <Button onClick={handleSaveVideoEdit} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
