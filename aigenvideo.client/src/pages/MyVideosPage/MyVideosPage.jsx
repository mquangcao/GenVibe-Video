'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Edit3, Share2, Trash2, MoreVertical, Play, Search, Filter, Grid3X3, List, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMyVideos } from '@/apis/videoService';

export default function MyVideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteVideoId, setDeleteVideoId] = useState(null);

  const filteredVideos = videos.filter((video) => video.caption.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    const loadMyVideos = async () => {
      try {
        const response = await getMyVideos();
        console.log(response.data.data);
        if (response.data.success) {
          setVideos(response.data.data);
        } else {
          console.error('No videos found');
        }
      } catch (error) {
        console.error('Failed to load videos:', error);
      }
    };
    loadMyVideos();
  }, []);

  console.log('checkkk');

  const generateThumbnail = (videoUrl) => {
    if (videoUrl.includes('cloudinary.com')) {
      try {
        // Tách các phần của URL
        const url = new URL(videoUrl);
        const pathParts = url.pathname.split('/');
        // Tìm index của 'upload'
        const uploadIndex = pathParts.findIndex((part) => part === 'upload');
        if (uploadIndex === -1) {
          return '/placeholder.svg?height=200&width=300';
        }
        // Lấy phần sau 'upload'
        const afterUpload = pathParts.slice(uploadIndex + 1);
        // Loại bỏ extension và thêm .jpg
        const lastPart = afterUpload[afterUpload.length - 1];
        const nameWithoutExt = lastPart.replace(/\.(mp4|mov|avi|mkv|webm)$/i, '');
        afterUpload[afterUpload.length - 1] = nameWithoutExt + '.jpg';
        // Tạo URL thumbnail với transformation đơn giản hơn
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

  const handleDeleteVideo = (videoId) => {
    setVideos(videos.filter((video) => video.id !== videoId));
    setDeleteVideoId(null);
  };

  const handleEditVideo = (videoId) => {
    navigate(`/edit/${videoId}`);
  };

  const handleShareVideo = (videoId) => {
    navigate(`/upload/${videoId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Videos</h1>
              <p className="text-gray-600 mt-2">Manage and organize your AI-generated videos</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Video
            </Button>
          </div>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search videos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" size="sm" className="!border !border-gray-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2 " />
              Filter
            </Button>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
            <Card className="max-w-sm">
              <CardContent className="p-4 !pb-0 !pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Videos</p>
                    <p className="text-2xl font-bold">{videos.length}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Videos Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="group hover:shadow-lg transition-shadow duration-200 flex flex-col !p-0">
                <CardHeader className="p-0 !-mb-4">
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <Avatar className="w-full h-full rounded-t-lg rounded-b-none">
                      <AvatarImage
                        src={generateThumbnail(video.videoUrl) || '/placeholder.svg'}
                        alt={video.caption}
                        className="w-full h-full object-cover"
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-500 w-full h-full rounded-t-lg rounded-b-none">
                        <Play className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => window.open(video.videoUrl, '_blank')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 !pb-0 !pt-0 flex-1">
                  {/* Caption với giới hạn 3 dòng */}
                  <p className="text-gray-800 text-sm mb-3 line-clamp-3 leading-relaxed">{video.caption}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-auto">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(video.createdAt)}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent h-9 !border !border-gray-300 hover:!border-gray-400"
                    onClick={() => handleEditVideo(video.id)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent h-9 !border !border-gray-300 hover:!border-gray-400"
                    onClick={() => handleShareVideo(video.id)}
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-transparent !border !border-gray-300">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDeleteVideoId(video.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <Card key={video.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-32 h-20 rounded-lg">
                        <AvatarImage
                          src={generateThumbnail(video.videoUrl) || '/placeholder.svg'}
                          alt={video.caption}
                          className="w-full h-full object-cover"
                        />
                        <AvatarFallback className="bg-gray-200 text-gray-500 w-32 h-20 rounded-lg">
                          <Play className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          {/* Caption với giới hạn 3 dòng trong list view */}
                          <p className="text-gray-800 text-sm mb-2 line-clamp-3 leading-relaxed">{video.caption}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(video.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditVideo(video.id)}>
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleShareVideo(video.id)}>
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDeleteVideoId(video.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-4">{searchTerm ? 'Try adjusting your search terms' : 'Start creating your first AI video'}</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Video
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Video</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete this video? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteVideoId && handleDeleteVideo(deleteVideoId)} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
