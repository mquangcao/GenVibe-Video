'use client';

import { BarChart3, Play, Heart, MessageCircle, Share, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';

// Sample data - replace with your actual data
const sampleData = {
  platformName: 'YouTube',
  stats: {
    views: 4500000,
    likes: 170000,
    comments: 551,
    shares: 4137,
  },
  detailedStats: {
    totalViews: 4514964,
    totalWatchTime: '11653 giờ:26 phút:44 giây',
    avgWatchTime: '9.0 phút',
    completionRate: '52.18%',
    newSubscribers: 11633,
  },
  chartData: [
    { date: '21/3', views: 800000 },
    { date: '22/3', views: 1200000 },
    { date: '23/3', views: 1800000 },
    { date: '24/3', views: 1600000 },
    { date: '25/3', views: 400000 },
    { date: '26/3', views: 300000 },
    { date: '27/3', views: 250000 },
  ],
};

export default function AnalyticsDialog() {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full !border !border-gray-300 bg-white hover:bg-gray-50">
          <BarChart3 className="w-4 h-4 mr-2" />
          Xem thống kê
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 h-[85vh] overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-white border-b sticky top-0 z-10 -mb-4">
          <DialogClose asChild>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </DialogClose>
          <h2 className="text-lg font-semibold text-gray-900">Phân tích video</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Top Stats */}
          <div className="bg-white p-6 border-b">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-red-600 fill-current" />
                </div>
                <div className="text-xl font-bold font-mono text-gray-900">{formatNumber(sampleData.stats.views)}</div>
                <div className="text-xs text-gray-500 mt-1">Lượt xem</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div className="text-xl font-bold font-mono text-gray-900">{formatNumber(sampleData.stats.likes)}</div>
                <div className="text-xs text-gray-500 mt-1">Lượt thích</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-xl font-bold font-mono text-gray-900">{sampleData.stats.comments}</div>
                <div className="text-xs text-gray-500 mt-1">Bình luận</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <Share className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-xl font-bold font-mono text-gray-900">{formatNumber(sampleData.stats.shares)}</div>
                <div className="text-xs text-gray-500 mt-1">Chia sẻ</div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Statistics Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Số liệu chính</h3>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Cập nhật lần cuối: 7/1/2025</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4">
                    <div className="text-xs text-blue-700 font-medium mb-2">Số lượt xem video</div>
                    <div className="text-2xl font-bold font-mono text-blue-900">{sampleData.detailedStats.totalViews.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600 font-medium mb-2">Tổng thời gian phát</div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold font-mono text-gray-900">11,653 giờ</div>
                      <div className="text-sm font-mono text-gray-600">26 phút 44 giây</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600 font-medium mb-2">Thời gian xem TB</div>
                    <div className="text-2xl font-bold font-mono text-gray-900">{sampleData.detailedStats.avgWatchTime}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600 font-medium mb-2">Tỷ lệ xem hết</div>
                    <div className="text-2xl font-bold font-mono text-gray-900">{sampleData.detailedStats.completionRate}</div>
                  </CardContent>
                </Card>
              </div>

              {/* New Subscribers */}
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
                <CardContent className="p-4">
                  <div className="text-sm text-orange-700 font-medium mb-1">Người đăng ký mới</div>
                  <div className="text-2xl font-bold font-mono text-orange-900">
                    {sampleData.detailedStats.newSubscribers.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Lượt xem theo thời gian</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sampleData.chartData}>
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          tickFormatter={(value) => formatNumber(value)}
                          width={40}
                        />
                        <Tooltip
                          formatter={(value) => [formatNumber(value), 'Lượt xem']}
                          labelStyle={{ color: '#374151', fontSize: '12px' }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#colorGradient)"
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: '#3b82f6' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
