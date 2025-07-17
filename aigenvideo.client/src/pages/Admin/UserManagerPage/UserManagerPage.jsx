import React, { useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BadgeCheckIcon, BadgeInfoIcon, User, ShieldUser, SquareX, CircleUserRound, ChevronDownIcon, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
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
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const sortOptions = [
  { label: 'Sort by Email', value: { sort: 'email', order: 'asc' } },
  { label: 'Sort by Name', value: { sort: 'name', order: 'asc' } },
];

const filterSchema = z.object({
  id: z.string().optional(),
  email: z
    .string()
    .transform((val) => val.trim()) // loại bỏ khoảng trắng nếu có
    .refine((val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Email không hợp lệ',
    }),
  role: z.string().min(1, 'Phải chọn vai trò'),
  lockoutEnabled: z.string(), // chưa bắt buộc
});

const roles = [
  { key: 'all', label: '-- Chọn vai trò --' },
  { key: 'user', label: 'User' },
  { key: 'admin', label: 'Admin' },
  { key: 'vip', label: 'VIP' },
];

const lockoutEnabled = [
  { key: 'all', label: '-- Chọn trạng thái --' },
  { key: 'locked', label: 'Locked' },
  { key: 'active', label: 'Active' },
];

const FilterForm = ({ onFilterAdvanced, query }) => {
  const dialogCloseRef = useRef(null);
  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      id: '',
      email: '',
      role: query.role || roles[0].key, // Default to 'all'
      lockoutEnabled: query.lockoutEnabled || lockoutEnabled[0].key, // Default to 'all'
    },
  });
  const onSubmits = (data) => {
    onFilterAdvanced(data);
    dialogCloseRef.current?.click();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmits)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
          <DialogDescription>Use the form below to filter users based on ID, email, role, and lockout status.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID</FormLabel>
                <FormControl>
                  <Input placeholder="Input ID..." {...field} />
                </FormControl>
                <FormDescription>If you know the user's ID, you can enter it here.</FormDescription>
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
                <FormDescription>If you know the user's email, you can enter it here.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>

                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={'border !border-gray-600 w-full '}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectGroup>
                      {roles &&
                        roles.map((role) => (
                          <SelectItem key={role.key} value={role.key}>
                            {role.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormDescription>The role you want to filter.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lockoutEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lockout Status</FormLabel>

                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={'border !border-gray-600 w-full '}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectGroup>
                      {lockoutEnabled &&
                        lockoutEnabled.map((lockoutEnd) => (
                          <SelectItem key={lockoutEnd.key} value={lockoutEnd.key}>
                            {lockoutEnd.label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormDescription>The lockout status you want to filter.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={dialogCloseRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">OK</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const FilterSearchSelect = ({ handleOptionSortChange, handleSearchChange, onFilterAdvanced, query }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Input placeholder="Filter ..." className="w-full lg:w-sm" onChange={(e) => handleSearchChange(e.target.value)} />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 !border !border-gray-600 text-gray-500 font-light">
              <ListFilter />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <FilterForm {...{ onFilterAdvanced, query }} />
          </DialogContent>
        </Dialog>

        <Select onValueChange={handleOptionSortChange}>
          <SelectTrigger className={'border !border-gray-600  '}>
            <SelectValue placeholder={<span>Sort by Email</span>} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup defaultValue="email">
              {sortOptions.map((option, index) => (
                <SelectItem key={index} value={option.value.sort}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="secondary" className="bg-blue-500 text-white hover:text-blue-600">
          <Link to="/admin/user-manager/create">Create User</Link>
        </Button>
      </div>
    </div>
  );
};

const UserManagerPage = () => {
  const isFirstRender = useRef(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 1000);
  const [query, updateQuery, setQuery] = useQuery({
    page: 1,
    limit: 10,
    sort: 'email',
    order: 'asc',
    search: '',
    id: '',
    email: '',
    role: 'all',
    lockoutEnabled: 'all',
  });
  const { data, loading, error } = useFetchList('/api/admin/users', query);
  let items = [];
  if (data) {
    console.log(data);
    items = data.items.map((user) => ({
      id: user.id,
      name: user.fullName || 'N/A',
      email: user.email || 'N/A',
      isLocked: user.isLocked,
      role: user.role.toUpperCase() || 'USER',
      expires: user.expires ? new Date(user.expires) : null,
    }));
  }
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
    updateQuery({
      ...filterData,
      page: 1,
    });
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
    <div className="items-center py-4 w-[calc(100%-80px)] mx-auto">
      <FilterSearchSelect {...{ handleOptionSortChange, handleSearchChange, onFilterAdvanced, query }} />
      {data && <span className="text-sm text-gray-500">Total Users: {data.count}</span>}

      <div className="border rounded-lg overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow className={'bg-gray-100 h-8'}>
              <TableHead className="w-[120px] hidden lg:table-cell text-center">ID</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Email</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Lockout</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items &&
              items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden lg:table-cell text-center break-all leading-tight text-xs">{user.id}</TableCell>
                  <TableCell className="hidden lg:table-cell text-center">{user.email}</TableCell>
                  <TableCell className="text-center">{user.name}</TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    <Badge
                      variant="secondary"
                      className={user.isLocked ? 'bg-red-500 text-white dark:bg-red-600' : 'bg-green-500 text-white dark:bg-green-600'}
                    >
                      {user.isLocked ? <SquareX className="size-4" /> : <User className="size-4" />}
                      {user.isLocked ? 'Locked' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        user.role === 'ADMIN'
                          ? 'bg-blue-500 text-white dark:bg-blue-600'
                          : user.role === 'VIP'
                          ? 'bg-purple-500 text-white dark:bg-purple-600'
                          : 'bg-gray-500 text-white dark:bg-gray-600'
                      }
                    >
                      {user.role === 'ADMIN' ? <ShieldUser /> : user.role === 'VIP' ? <CircleUserRound /> : <BadgeInfoIcon />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" className="ml-2 bg-amber-300">
                      <Link to={`/admin/user-manager/${user.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {data && (
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

export default UserManagerPage;
