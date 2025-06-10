import React, { useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BadgeCheckIcon, BadgeInfoIcon, User, ShieldUser, SquareX, CircleUserRound, ChevronDownIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import PaginationWrapper from '@/components/PaginationWrapper';
import { useDebounce, useFetchList, useQuery } from '@/hooks';

const sortOptions = [
  { label: 'Sort by Email', value: { sort: 'email', order: 'asc' } },
  { label: 'Sort by Name', value: { sort: 'name', order: 'asc' } },
];

const FilterSearchSelect = ({ handleOptionSortChange, handleSearchChange }) => {
  return (
    <div className="flex justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Input placeholder="Filter ..." className="w-[200px] md:w-sm" onChange={(e) => handleSearchChange(e.target.value)} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        {/* <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Place content for the popover here.</PopoverContent>
        </Popover> */}
        <Select onValueChange={handleOptionSortChange}>
          <SelectTrigger className={'border !border-gray-600 '}>
            <SelectValue placeholder="Sort by Email" />
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
    limit: 5,
    sort: 'email',
    order: 'asc',
    search: '',
  });
  const { data, loading, error } = useFetchList('/api/admin/users', query);
  let items = [];
  if (data) {
    items = data.items.map((user) => ({
      id: user.id,
      name: user.fullName || 'N/A',
      email: user.email || 'N/A',
      isLocked: user.lockoutEnd || false,
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
      <FilterSearchSelect handleOptionSortChange={handleOptionSortChange} handleSearchChange={handleSearchChange} />
      {data && <span className="text-sm text-gray-500">Total Users: {data.count}</span>}

      <Table className={' mt-4  '}>
        <TableHeader>
          <TableRow>
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
                <TableCell className="hidden lg:table-cell text-center">{user.id}</TableCell>
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
