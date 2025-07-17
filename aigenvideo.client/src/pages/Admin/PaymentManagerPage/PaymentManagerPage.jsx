import React, { useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ListFilter, Eye, CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PaginationWrapper from '@/components/PaginationWrapper';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDebounce, useFetchList, useQuery } from '@/hooks';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatCurrencyVnd, toUtcEndOfDay, toUtcStartOfDay } from '@/utils';
import { GatewayCell } from './GatewayCell';
import { PaymentInfoModal } from './PaymentInfoModal';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const filterSchema = z
  .object({
    id: z.string().optional(),
    email: z
      .string()
      .transform((val) => val.trim()) // loại bỏ khoảng trắng nếu có
      .refine((val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'Email không hợp lệ',
      }),
    fromDate: z.date().optional(),
    toDate: z.date().optional(),
    status: z.string().min(1, 'Phải chọn trạng thái'),
  })
  .refine(
    (data) => {
      if (data.fromDate && data.toDate) {
        return data.fromDate <= data.toDate;
      }
      return true;
    },
    {
      message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
      path: ['toDate'],
    }
  );

const statusOptions = [
  { key: 'all', label: '-- Tất cả trạng thái --' },
  { key: 'pending', label: 'Pending' },
  { key: 'success', label: 'Success' },
  { key: 'failed', label: 'Failed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const FilterForm = ({ onFilterAdvanced, query, resetFilter }) => {
  const dialogCloseRef = useRef(null);
  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      id: query.id || '',
      email: query.email || '',
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      status: query.status || statusOptions[0].key, // Default to 'all'
    },
  });

  const onSubmits = (data) => {
    const filterData = {
      ...data,
      id: data.id ? data.id.trim() : '',
      email: data.email ? data.email.trim() : '',
      status: data.status, // Convert 'all' to empty string
      fromDate: toUtcStartOfDay(data.fromDate)?.toISOString() ?? '',
      toDate: toUtcEndOfDay(data.toDate)?.toISOString() ?? '',
    };

    console.log({
      fromDate: toUtcStartOfDay(data.fromDate)?.toISOString() ?? '',
      toDate: toUtcEndOfDay(data.toDate)?.toISOString() ?? '',
    });
    onFilterAdvanced(filterData);
    dialogCloseRef.current?.click();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmits)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Filter Payments</DialogTitle>
          <DialogDescription>Use the form below to filter payments based on ID, email, date range, and status.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment ID</FormLabel>
                <FormControl>
                  <Input placeholder="Input Payment ID..." {...field} />
                </FormControl>
                <FormDescription>If you know the payment ID, you can enter it here.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Input Email..." {...field} />
                </FormControl>
                <FormDescription>Filter by customer email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fromDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>From Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Start date for filtering.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>To Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>End date for filtering.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={'border !border-gray-600 w-full '}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.key} value={status.key}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormDescription>The payment status you want to filter.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={dialogCloseRef}>
              Close
            </Button>
          </DialogClose>
          <Button type="button" variant="outline" onClick={() => resetFilter(dialogCloseRef)}>
            Reset Filter
          </Button>
          <Button type="submit">Apply Filter</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
const sortOptions = [
  { label: 'Sort by Email', value: { sort: 'email', order: 'asc' } },
  { label: 'Sort by Amount', value: { sort: 'amount', order: 'desc' } },
  { label: 'Sort by Date', value: { sort: 'createdAt', order: 'desc' } },
];
const FilterSearchSelect = ({ handleOptionSortChange, handleSearchChange, onFilterAdvanced, query, resetFilter }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Input placeholder="Search payments..." className="w-full lg:w-sm" onChange={(e) => handleSearchChange(e.target.value)} />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 !border !border-gray-600 text-gray-500 font-light">
              <ListFilter />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <FilterForm {...{ onFilterAdvanced, query, resetFilter }} />
          </DialogContent>
        </Dialog>

        <Select onValueChange={handleOptionSortChange}>
          <SelectTrigger className={'border !border-gray-600  '}>
            <SelectValue placeholder={<span>Sort by Email</span>} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sortOptions.map((option, index) => (
                <SelectItem key={index} value={option.value.sort}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const PaymentManagerPage = () => {
  const isFirstRender = useRef(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 1000);
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
  console.log('query params:', query);
  const { data } = useFetchList('/api/admin/payments', query);
  let items = [];
  if (data) {
    console.log(data);
    items = data.items.map((payment) => ({
      id: payment.paymentId,
      email: payment.email || 'N/A',
      name: payment.packageName || 'N/A',
      amount: formatCurrencyVnd(payment.amount) || 0,
      gateway: payment.gateway || 'N/A',
      status: payment.status || 'N/A',
      createdAt: new Date(payment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }));
  }
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const openInfoModal = (payment) => {
    setSelectedPayment(payment);
    setIsInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedPayment(null);
  };
  const handleOptionSortChange = (value) => {
    const index = sortOptions.findIndex((option) => option.value.sort === value);
    if (index === -1) return;
    const selectedOption = sortOptions[index].value;
    updateQuery({
      ...selectedOption,
      page: 1, // Reset to first page on sort change
    });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const onFilterAdvanced = (filterData) => {
    console.log('filterData', {
      ...filterData,
      page: 1,
    });
    console.log('first');
    updateQuery({
      ...filterData,
      page: 1,
    });
  };

  const resetFilter = (dialogCloseRef) => {
    updateQuery({
      id: '',
      email: '',
      fromDate: '',
      toDate: '',
      status: 'all',
    });
    dialogCloseRef.current?.click();
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debouncedSearch.trim() !== '') {
      updateQuery({ search: debouncedSearch, page: 1 });
    } else {
      updateQuery({ search: '', page: 1 });
    }
  }, [debouncedSearch]);

  return (
    <div className="items-center py-4 w-[calc(100%-80px)] mx-auto ">
      <FilterSearchSelect {...{ handleOptionSortChange, handleSearchChange, onFilterAdvanced, query, resetFilter }} />
      {data && <span className=" text-lg font-semibold mb-8">Total Users: {data.count}</span>}

      <div className="border rounded-lg overflow-hidden mt-4 ">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 h-8 ">
              <TableHead className="w-[120px] hidden xl:table-cell py-4 text-gray-600 font-semibold">PaymentId</TableHead>
              <TableHead className=" py-4 text-gray-600 font-semibold">Email</TableHead>
              <TableHead className="hidden lg:table-cell text-center py-4 text-gray-600 font-semibold">Name</TableHead>
              <TableHead className=" text-center py-4 text-gray-600 font-semibold">Amount</TableHead>
              <TableHead className="text-center py-4 text-gray-600 font-semibold">Gateway</TableHead>
              <TableHead className="text-center py-4 text-gray-600 font-semibold">Status</TableHead>
              <TableHead className="hidden lg:table-cell py-4 text-gray-600 font-semibold">CreatedAt</TableHead>
              <TableHead className="text-center py-4 text-gray-600 font-semibold  ">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items &&
              items.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="hidden xl:table-cell font-mono text-sm ">
                    <div className="break-all leading-tight text-xs">{payment.id}</div>
                  </TableCell>
                  <TableCell className="">{payment.email}</TableCell>
                  <TableCell className="hidden lg:table-cell text-center text-orange-600 font-medium">{payment.name}</TableCell>
                  <TableCell className="text-center font-semibold">{payment.amount}</TableCell>
                  <TableCell className="text-center">{GatewayCell({ gateway: payment.gateway })}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        payment.status === 'pending'
                          ? 'bg-yellow-400 text-white dark:bg-yellow-500'
                          : payment.status === 'success'
                          ? 'bg-green-400 text-white dark:bg-green-500'
                          : 'bg-gray-500 text-white dark:bg-gray-600'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{payment.createdAt}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                      onClick={() => openInfoModal(payment)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Info
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <PaymentInfoModal payment={selectedPayment} isOpen={isInfoModalOpen} onClose={closeInfoModal} />
      {items && items.length > 0 && (
        <PaginationWrapper
          currentPage={query.page}
          totalPage={Math.ceil(data.count / query.limit)}
          onPageChange={(page) => {
            updateQuery({ page });
          }}
        />
      )}
    </div>
  );
};

export default PaymentManagerPage;
//
