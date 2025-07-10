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
  Copy,
  Check,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AnalyticsDialog from './AnalyticsDialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getVideoById, getVideoUploadedPlatforms, uploadVideoToPlatform } from '@/apis/videoService';

function generateVideoUrl(platformCode, videoId) {
  if (!platformCode || !videoId) return null;

  switch (platformCode.toLowerCase()) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${videoId}`;
    case 'tiktok':
      return `https://www.tiktok.com/video/${videoId}`;
    case 'facebook':
      return `https://www.facebook.com/video.php?v=${videoId}`;
    default:
      return null;
  }
}

export default function SocialVideoManagementPage() {
  const { videoid } = useParams();
  console.log('Video ID:', videoid);
  const [videoData, setVideoData] = useState({
    videoUrl: 'How to Build a Modern React App in 2024',
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
      uploaded: false,
      connected: false,
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
      uploaded: false,
      connected: false,
    },
  ]);

  useState(() => {
    const getVideoData = async () => {
      try {
        const response = await getVideoById(videoid);

        if (response.data.success) {
          const backendRsp = response.data.data;
          setVideoData({
            id: backendRsp.id,
            caption: backendRsp.caption,
            videoUrl: backendRsp.videoUrl,
            createdDate: backendRsp.createdDate,
          });
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    };

    getVideoData();

    const getVideoPlatform = async () => {
      try {
        console.log('checkckck');
        const response = await getVideoUploadedPlatforms(videoid);
        if (response.data.success) {
          console.log('Video data fetched successfully:', response.data.data);
          const backendData = response.data.data;
          const updated = platforms.map((p) => {
            const match = backendData.find((x) => {
              console.log('x.platformCode:', x, 'p.platform:', p.platform);
              return x.platformCode === p.platform;
            });
            return {
              ...p,
              connected: match.isConnect,
              uploaded: match.isPublish,
              url: generateVideoUrl(p.platform, match.videoId),
              title: match.title,
              description: match.description,
              uploadDate: new Date(match.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              stats: {
                views: match.analytics.basicStats.viewCount || '0',
                likes: match.analytics.basicStats.likeCount || '0',
                comments: match.analytics.basicStats.commentCount || '0',
                shares: match.analytics.basicStats.shareCount || '0',
              },
              analytics: match.analytics,
            };
          });
          setPlatforms(updated);
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    };

    getVideoPlatform();
  }, []);

  const [editingPlatform, setEditingPlatform] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoEditForm, setVideoEditForm] = useState({ title: '', description: '' });
  const [uploadingPlatform, setUploadingPlatform] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '' });
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleUploadClick = (platform) => {
    setUploadForm({
      title: videoData.title,
      description: videoData.description,
    });
    setUploadingPlatform(platform);
  };

  const handleConfirmUpload = async () => {
    console.log(uploadingPlatform);
    if (uploadingPlatform) {
      // Close popup immediately to prevent spam
      setUploadingPlatform(null);

      try {
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
        const response = await uploadVideoToPlatform({
          tags: 'upload',
          platformCode: uploadingPlatform,
          title: uploadForm.title,
          description: uploadForm.description,
          videoUrl: videoData.videoUrl,
          videoId: videoid,
        });
        if (response.data.success) {
          console.log('Upload successful:', response.data);
        } else {
          console.error('Upload failed:', response.data.message);
        }
      } catch (error) {
        console.error('Error uploading video:', error);
      }
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

  const generateThumbnail = (videoUrl) => {
    if (videoUrl.includes('cloudinary.com')) {
      try {
        const url = new URL(videoUrl);
        const pathParts = url.pathname.split('/');
        const uploadIndex = pathParts.findIndex((part) => part === 'upload');
        if (uploadIndex === -1) {
          return '/placeholder.svg?height=200&width=300';
        }
        const afterUpload = pathParts.slice(uploadIndex + 1);
        const lastPart = afterUpload[afterUpload.length - 1];
        const nameWithoutExt = lastPart.replace(/\.(mp4|mov|avi|mkv|webm)$/i, '');
        afterUpload[afterUpload.length - 1] = nameWithoutExt + '.jpg';
        const baseUrl = `${url.protocol}//${url.host}`;
        const cloudPath = pathParts.slice(0, uploadIndex + 1).join('/');
        const transformations = 'c_thumb,w_300,h_200,f_auto,q_auto';
        return `${baseUrl}${cloudPath}/${transformations}/${afterUpload.join('/')}`;
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        return '/placeholder.svg?height=200&width=300';
      }
    }
    return '/placeholder.svg?height=200&width=300';
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(videoData.videoUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
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
        <Card className="border-0 shadow-sm !py-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Video Thumbnail */}
              <div className="relative" onClick={() => window.open(videoData.videoUrl, '_blank')}>
                <Avatar className="w-full lg:w-80 h-48 rounded-lg cursor-pointer">
                  <AvatarImage
                    src={generateThumbnail(videoData.videoUrl) || '/placeholder.svg'}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-500 w-full h-full rounded-lg">
                    <Play className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                    <Play className="w-6 h-6 text-slate-700 ml-1" />
                  </div>
                </div>
              </div>

              {/* Video Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-700 text-base leading-relaxed mb-4">{videoData.caption}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVideoEdit}
                    className="!border !border-gray-300 bg-transparent hover:!border-gray-400"
                  >
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

                {/* Video URL */}
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="video-url" className="text-sm font-medium">
                    Video URL
                  </Label>
                  <div className="flex gap-2">
                    <Input id="video-url" value={videoData.videoUrl} readOnly className="flex-1" />
                    <Button variant="outline" size="sm" onClick={handleCopyUrl} className="px-3 bg-transparent !border !border-gray-300">
                      {copiedUrl ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {copiedUrl && <p className="text-sm text-green-600">URL copied to clipboard!</p>}
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
                      <AnalyticsDialog analytics={platform.analytics} />

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
