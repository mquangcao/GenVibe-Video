'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, DollarSign, TrendingUp, Users, Search, Download, RefreshCw } from 'lucide-react';
import { useFetchList, useQuery } from '@/hooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getSummary } from '@/apis/paymentService';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const mockPayments = [
  {
    paymentId: 'PAY_001',
    amount: 299000,
    currency: 'VND',
    status: 'success',
    gateway: 'momo',
    createdAt: '2024-01-15T10:30:00Z',
    paidAt: '2024-01-15T10:32:00Z',
    user: { name: 'Nguyễn Văn A', email: 'nguyenvana@email.com' },
  },
  {
    paymentId: 'PAY_002',
    amount: 599000,
    currency: 'VND',
    status: 'success',
    gateway: 'vnpay',
    createdAt: '2024-01-15T14:20:00Z',
    paidAt: '2024-01-15T14:22:00Z',
    user: { name: 'Trần Thị B', email: 'tranthib@email.com' },
  },
  {
    paymentId: 'PAY_003',
    amount: 299000,
    currency: 'VND',
    status: 'pending',
    gateway: 'momo',
    createdAt: '2024-01-15T16:45:00Z',
    paidAt: null,
    user: { name: 'Lê Văn C', email: 'levanc@email.com' },
  },
  {
    paymentId: 'PAY_004',
    amount: 999000,
    currency: 'VND',
    status: 'failed',
    gateway: 'vnpay',
    createdAt: '2024-01-15T18:10:00Z',
    paidAt: null,
    user: { name: 'Phạm Thị D', email: 'phamthid@email.com' },
  },
  {
    paymentId: 'PAY_005',
    amount: 599000,
    currency: 'VND',
    status: 'success',
    gateway: 'momo',
    createdAt: '2024-01-14T09:15:00Z',
    paidAt: '2024-01-14T09:17:00Z',
    user: { name: 'Hoàng Văn E', email: 'hoangvane@email.com' },
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    success: { label: 'Thành công', variant: 'default', className: 'bg-green-100 text-green-800' },
    pending: { label: 'Đang xử lý', variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
    failed: { label: 'Thất bại', variant: 'destructive', className: 'bg-red-100 text-red-800' },
    expired: { label: 'Hết hạn', variant: 'outline', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getGatewayBadge = (gateway) => {
  const gatewayConfig = {
    momo: { label: 'MoMo', className: 'bg-pink-100 text-pink-800' },
    vnpay: { label: 'VNPay', className: 'bg-blue-100 text-blue-800' },
  };

  const config = gatewayConfig[gateway];
  return config ? (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  ) : (
    <Badge variant="outline">{gateway}</Badge>
  );
};

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [payments, setPayments] = useState(mockPayments);

  // Calculate statistics
  const totalPayments = payments.length;
  const successfulPayments = payments.filter((p) => p.status === 'success');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const successRate = ((successfulPayments.length / totalPayments) * 100).toFixed(1);

  const momoPayments = payments.filter((p) => p.gateway === 'momo');
  const vnpayPayments = payments.filter((p) => p.gateway === 'vnpay');
  const momoRevenue = momoPayments.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
  const vnpayRevenue = vnpayPayments.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesGateway = gatewayFilter === 'all' || payment.gateway === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  const [query, updateQuery, resetData] = useQuery({
    page: 1,
    limit: 10,
    sort: 'email',
    order: 'asc',
    search: '',
    id: '',
    email: '',
    fromDate: '',
    toDate: '',
    status: 'all',
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    successRate: 0,
    compareWithLastMonth: {
      transactions: 0,
      revenue: 0,
      successRate: 0,
    },
    byGateway: {
      vnpay: {
        amount: 0,
        amountPercentage: 0,
        countPercentage: 0,
        count: 0,
      },
      momo: {
        amount: 0,
        amountPercentage: 0,
        countPercentage: 0,
        count: 0,
      },
    },
    byStatus: [
      {
        count: 0,
        percentage: 0,
        code: 'success',
        status: 'Thành công',
      },
      {
        count: 0,
        percentage: 0,
        code: 'pending',
        status: 'Đang xử lý',
      },
      {
        count: 0,
        percentage: 0,
        code: 'failed',
        status: 'Thất bại',
      },
      {
        count: 0,
        percentage: 0,
        code: 'expired',
        status: 'Hết hạn',
      },
    ],
  });

  const { data } = useFetchList('/api/admin/payments', query);
  useEffect(() => {
    const items = !data
      ? mockPayments
      : data.items.map((payment) => ({
          paymentId: payment.paymentId,
          user: {
            name: payment.name || 'N/A',
            email: payment.email || 'N/A',
          },
          currency: 'VND',
          status: payment.status || 'expired',
          gateway: payment.gateway || 'N/A',
          email: payment.email || 'N/A',
          name: payment.packageName || 'N/A',
          amount: payment.amount || 0,
          createdAt: payment.createdAt,
        }));

    const getSummaryPayment = async () => {
      try {
        const response = await getSummary();
        const mergedByGateway = {
          ...dashboardStats.byGateway,
          ...(response.data.byGateway || {}),
        };
        setDashboardStats((prev) => ({
          ...prev,
          ...response.data,
          byGateway: mergedByGateway,
        }));
      } catch (error) {
        console.error('Failed to fetch payment summary:', error);
      }
    };
    getSummaryPayment();
    setPayments(items);
  }, [data]);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Quản lý và thống kê các giao dịch thanh toán</p>
            </div>
            <div className="flex items-center gap-3 ">
              <Button variant="outline" size="sm" className="!border-gray-300 !border">
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button variant="outline" size="sm" className="!border-gray-300 !border">
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">{`${dashboardStats.compareWithLastMonth.transactions}%`} so với tháng trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">{`${dashboardStats.compareWithLastMonth.revenue}%`} so với tháng trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">{`${dashboardStats.compareWithLastMonth.successRate}%`} so với tháng trước</p>
            </CardContent>
          </Card>
        </div>

        {/* Gateway Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo cổng thanh toán</CardTitle>
              <CardDescription>So sánh hiệu suất giữa MoMo và VNPay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">MoMo</p>
                      <p className="text-sm text-gray-600">{dashboardStats.byGateway.momo.count} giao dịch</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(dashboardStats.byGateway.momo.amount)}</p>
                    <p className="text-sm text-gray-600">{dashboardStats.byGateway.momo.countPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">VNPay</p>
                      <p className="text-sm text-gray-600">{dashboardStats.byGateway.vnpay.count} giao dịch</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(dashboardStats.byGateway.vnpay.amount)}</p>
                    <p className="text-sm text-gray-600">{dashboardStats.byGateway.vnpay.countPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo trạng thái</CardTitle>
              <CardDescription>Phân bố trạng thái giao dịch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.byStatus.map((status) => {
                  const count = status.count;
                  const percentage = status.percentage.toFixed(1);
                  return (
                    <div key={status.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(status.code)}
                        <span className="text-sm">{count} giao dịch</span>
                      </div>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>Danh sách các giao dịch mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email hoặc mã giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] !border-gray-300 !border">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                <SelectTrigger className="w-full sm:w-[150px] !border-gray-300 !border">
                  <SelectValue placeholder="Cổng thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cổng</SelectItem>
                  <SelectItem value="momo">MoMo</SelectItem>
                  <SelectItem value="vnpay">VNPay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã GD</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Cổng TT</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.paymentId}>
                      <TableCell className="text-gray-600 font-semibold">{payment.paymentId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.user.name}</div>
                          <div className="text-sm text-gray-500">{payment.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getGatewayBadge(payment.gateway)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{dayjs.utc(payment.createdAt).local().fromNow()}</div>
                          <div className="text-gray-500">{dayjs.utc(payment.createdAt).local().format('dd MM HH:mm')}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-gray-500">Không tìm thấy giao dịch nào phù hợp với bộ lọc</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
