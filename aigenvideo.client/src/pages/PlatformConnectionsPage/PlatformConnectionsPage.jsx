import React from 'react';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/common';
import { Users, Eye, Play, Settings, Unlink, Plus, CheckCircle, AlertTriangle, Clock, Link, Loader2 } from 'lucide-react';
import { getAllPlatformConnections, getPlatformInfo, getUrlConnection } from '@/apis/connectPlatformService';
import { useToast } from '@/hooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
export default function PlatformConnectionsPage() {
  const [platformSlots, setPlatformSlots] = useState([
    {
      platform: 'youtube',
      platformName: 'YouTube',
      platformIcon: <Icons.Youtube className="w-10 h-10" />,
      platformColor: 'text-red-600',
      bgColor: 'bg-red-50',
      loading: true,
    },
    {
      platform: 'tiktok',
      platformName: 'TikTok',
      platformIcon: <Icons.Tiktok className="w-10 h-10" />,
      platformColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      loading: true,
    },
    {
      platform: 'facebook',
      platformName: 'Facebook',
      platformIcon: <Icons.Facebook className="w-10 h-10" />,
      platformColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: true,
    },
  ]);
  const { ToastSuccess, ToastError } = useToast();

  useEffect(() => {
    const loadConnectedAccounts = async () => {
      console.log('Loading connected accounts...');
      try {
        var response = await getAllPlatformConnections();
        if (response.data.success) {
          console.log('Connected accounts:', response.data.data);
          const platformInfos = response.data.data;

          const mergedPlatforms = platformSlots.map((config) => {
            const info = platformInfos.find((p) => p.platformCode.toLowerCase() === config.platform.toLowerCase());
            const localDate = dayjs.utc(info.lastSync).local();
            const fromNow = localDate.fromNow();
            return info.isConnecting
              ? {
                  ...config,
                  loading: false,
                  connected: true,
                  account: {
                    name: info.channelName,
                    username: info.channelHandle,
                    avatar: info.avatarUrl,
                    verified: false,
                    stats: {
                      followers: info.subscriberCount,
                      views: info.viewCount,
                      videos: info.videoCount,
                    },
                  },
                  tokenStatus: 'healthy',
                  lastSync: fromNow,
                  connectedDate: new Date(info.connectedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                }
              : {
                  ...config,
                  loading: false,
                };
          });

          setPlatformSlots(mergedPlatforms);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadConnectedAccounts();
    // console.log('weiiii 111');
    // const handleMessage = async (event) => {
    //   console.log(event);
    //   console.log('weiiii 222');
    //   console.log('Received message from popup:', event.data);
    //   if (event.origin !== 'https://localhost:7073') return;
    //   const { success, platform } = event.data;
    //   console.log('Received message from popup:', event.data);
    //   if (success) {
    //     try {
    //       var platformInfo = await getPlatformInfo(platform);
    //       if (platformInfo.data.success) {
    //         const { channelName, subscriberCount, videoCount, viewCount, avatarUrl, channelHandle, connectedDate, lastSync } =
    //           platformInfo.data.data;
    //         console.log('Platform info:', platformInfo.data.data, platform, success);
    //         const localDate = dayjs.utc(lastSync).local();
    //         const fromNow = localDate.fromNow();
    //         setPlatformSlots((prev) =>
    //           prev.map((slot) =>
    //             slot.platform === platform
    //               ? {
    //                   ...slot,
    //                   loading: false,
    //                   connected: true,
    //                   account: {
    //                     name: channelName,
    //                     username: channelHandle,
    //                     avatar: avatarUrl,
    //                     verified: false,
    //                     stats: {
    //                       followers: subscriberCount,
    //                       views: viewCount,
    //                       videos: videoCount,
    //                     },
    //                   },
    //                   tokenStatus: 'healthy',
    //                   lastSync: fromNow,
    //                   connectedDate: new Date(connectedDate).toLocaleDateString('en-US', {
    //                     month: 'short',
    //                     day: 'numeric',
    //                     year: 'numeric',
    //                   }),
    //                 }
    //               : slot
    //           )
    //         );
    //         ToastSuccess(`Kết nối thành công với ${channelName}!`);
    //       }
    //     } catch (error) {
    //       console.error('Error fetching channel name:', error);
    //       ToastError('Kết nối thành công nhưng không thể lấy tên kênh!');
    //     }
    //   } else {
    //     ToastError('Kết nối thất bại!');
    //   }
    // };

    // window.addEventListener('message', handleMessage);

    // return () => {
    //   window.removeEventListener('message', handleMessage); // cleanup
    // };
    const bc = new BroadcastChannel('connect-channel');
    bc.onmessage = (event) => {
      console.log('Received from popup:', event.data);
      const { success, platform } = event.data;
      console.log('Received from popup:', event.data);
      if (success) {
        // xử lý tiếp
      }
    };
  }, []);
  // console.log('weiiii');
  // useEffect(() => {
  //   console.log('weiiii');

  //   const handleMessage = async (event) => {
  //     console.log('Received message from popup:', event.data);
  //     if (event.origin !== 'https://localhost:7073') return;
  //     const { success, platform } = event.data;
  //     console.log('Received message from popup:', event.data);
  //     if (success) {
  //       try {
  //         var platformInfo = await getPlatformInfo(platform);
  //         if (platformInfo.data.success) {
  //           const { channelName, subscriberCount, videoCount, viewCount, avatarUrl, channelHandle, connectedDate, lastSync } =
  //             platformInfo.data.data;
  //           console.log('Platform info:', platformInfo.data.data, platform, success);
  //           const localDate = dayjs.utc(lastSync).local();
  //           const fromNow = localDate.fromNow();
  //           setPlatformSlots((prev) =>
  //             prev.map((slot) =>
  //               slot.platform === platform
  //                 ? {
  //                     ...slot,
  //                     loading: false,
  //                     connected: true,
  //                     account: {
  //                       name: channelName,
  //                       username: channelHandle,
  //                       avatar: avatarUrl,
  //                       verified: false,
  //                       stats: {
  //                         followers: subscriberCount,
  //                         views: viewCount,
  //                         videos: videoCount,
  //                       },
  //                     },
  //                     tokenStatus: 'healthy',
  //                     lastSync: fromNow,
  //                     connectedDate: new Date(connectedDate).toLocaleDateString('en-US', {
  //                       month: 'short',
  //                       day: 'numeric',
  //                       year: 'numeric',
  //                     }),
  //                   }
  //                 : slot
  //             )
  //           );
  //           ToastSuccess(`Kết nối thành công với ${channelName}!`);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching channel name:', error);
  //         ToastError('Kết nối thành công nhưng không thể lấy tên kênh!');
  //       }
  //     } else {
  //       ToastError('Kết nối thất bại!');
  //     }
  //   };

  //   window.addEventListener('message', handleMessage);

  //   return () => {
  //     window.removeEventListener('message', handleMessage); // cleanup
  //   };
  // }, []);

  const handleConnect = async (platform) => {
    try {
      setPlatformSlots((prev) =>
        prev.map((slot) =>
          slot.platform === platform
            ? {
                ...slot,
                loading: true,
              }
            : slot
        )
      );
      var response = await getUrlConnection(platform);
      const popup = window.open(response.data.data.url, '_blank', 'popup,width=600,height=600');
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://localhost:7073') return;

        console.log('Received message from popup:', event.data);
      });
      // const popupCheckInterval = setInterval(() => {
      //   if (!popup || popup.closed) {
      //     clearInterval(popupCheckInterval);

      //     setPlatformSlots((prev) => prev.map((slot) => (slot.platform === platform ? { ...slot, loading: false } : slot)));
      //   }
      // }, 2000);
    } catch (err) {
      console.error(err);
      ToastError('Không thể kết nối.');
      setPlatformSlots((prev) =>
        prev.map((slot) =>
          slot.platform === platform
            ? {
                ...slot,
                loading: false,
              }
            : slot
        )
      );
    }
  };

  const handleDisconnect = (platform) => {
    setPlatformSlots((prev) =>
      prev.map((slot) =>
        slot.platform === platform
          ? {
              ...slot,
              connected: false,
              loading: false,
              account: undefined,
              tokenStatus: undefined,
              lastSync: undefined,
              connectedDate: undefined,
            }
          : slot
      )
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const connectedCount = platformSlots.filter((slot) => slot.connected === true).length;
  const healthyCount = platformSlots.filter((slot) => slot.tokenStatus === 'healthy').length;
  const errorCount = platformSlots.filter((slot) => slot.tokenStatus === 'error').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Platform Connections</h1>
          <p className="text-slate-600">Connect one account per platform to manage your social media presence</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ">
          <Card className="text-center border-0 shadow-sm !py-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-900">{connectedCount}/3</div>
              <div className="text-sm text-slate-600">Platforms Connected</div>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-sm !py-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
              <div className="text-sm text-slate-600">Active Connections</div>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-sm !py-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-slate-600">Connection Errors</div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {platformSlots.map((slot) => (
            <Card key={slot.platform} className="border-0 shadow-sm overflow-hidden !py-0">
              <CardHeader className={`${slot.bgColor} p-4 pb-3 border-b-0 `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={` bg-transparent rounded-lg ${slot.platformColor}`}>{slot.platformIcon}</div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{slot.platformName}</CardTitle>
                      <p className="text-sm text-slate-600 mt-0">
                        {slot.loading
                          ? 'Loading...'
                          : slot.connected === true
                          ? 'Connected'
                          : slot.connected === false
                          ? 'Not connected'
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {slot.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    slot.connected &&
                    slot.tokenStatus && <div className="flex items-center space-x-1">{getStatusIcon(slot.tokenStatus)}</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 -mt-6">
                {slot.loading ? (
                  /* Loading State */
                  <div className="flex flex-col h-full min-h-[280px]">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-3 border-t border-b">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="text-center space-y-2">
                            <Skeleton className="h-4 w-12 mx-auto" />
                            <Skeleton className="h-3 w-16 mx-auto" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ) : slot.connected === true && slot.account ? (
                  /* Connected State */
                  <div className="flex flex-col h-full min-h-[280px] ">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3 ">
                        <Avatar className="w-12 h-12 ">
                          <AvatarImage src={slot.account.avatar || '/placeholder.svg'} alt={slot.account.name} />
                          <AvatarFallback>{slot.account.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-900">{slot.account.name}</h3>
                            {slot.account.verified && <CheckCircle className="w-4 h-4 text-blue-600 fill-current" />}
                          </div>
                          <p className="text-sm text-slate-600">{slot.account.username}</p>
                        </div>
                      </div>

                      {slot.tokenStatus && <div className="flex justify-center">{getStatusBadge(slot.tokenStatus)}</div>}

                      <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-slate-200">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-slate-600">
                            <Users className="w-3 h-3" />
                            <span className="text-sm font-semibold">{slot.account.stats.followers}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Followers</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-slate-600">
                            <Eye className="w-3 h-3" />
                            <span className="text-sm font-semibold">
                              {slot.account.stats.views == -1 ? '..' : slot.account.stats.views}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Views</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-slate-600">
                            <Play className="w-3 h-3" />
                            <span className="text-sm font-semibold">{slot.account.stats.videos}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Videos</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-500">
                        {slot.lastSync && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Last sync: {slot.lastSync}</span>
                          </div>
                        )}
                        {slot.connectedDate && (
                          <div className="flex items-center space-x-1">
                            <Link className="w-3 h-3" />
                            <span>Connected: {slot.connectedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 !border !border-gray-300">
                        <Settings className="w-3 h-3 mr-2" />
                        Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(slot.platform)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 !border-red-200 !border !flex-1"
                      >
                        <Unlink className="w-3 h-3 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Not Connected State */
                  <div className="flex flex-col justify-between h-full min-h-[280px] text-center">
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Plus className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-1">Connect your {slot.platformName} account</h3>
                        <p className="text-sm text-slate-600">Link your {slot.platformName} account to start managing your content</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button onClick={() => handleConnect(slot.platform)} className="w-full">
                        <Link className="w-4 h-4 mr-2" />
                        Connect {slot.platformName}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Text */}
        <Card className="bg-blue-50 border-blue-200 border shadow-sm !py-0">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">One account per platform</p>
                <p className="text-blue-700">
                  You can connect one account for each platform. To switch accounts, disconnect the current one first, then connect your new
                  account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
