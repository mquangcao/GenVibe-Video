import { createUser } from '@/apis/userService';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { z } from 'zod';

const formSchema = z
  .object({
    email: z.string().email().min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Role is required'),
    toDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'vip') {
        if (!data.toDate) return false;
        return new Date(data.toDate).getTime() > Date.now();
      }
      return true;
    },
    {
      message: 'Expiry date must be in the future when role is VIP',
      path: ['toDate'],
    }
  );

const roles = [
  { key: 'user', label: 'User' },
  { key: 'admin', label: 'Admin' },
  { key: 'vip', label: 'VIP' },
];

const CreateUserPage = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: roles[0].key,
      toDate: '',
    },
  });
  const navigate = useNavigate();
  const { ToastSuccess, ToastError } = useToast();
  const role = form.watch('role');

  async function onSubmit(values) {
    try {
      const response = await createUser({
        ...values,
        toDate: values.toDate ? new Date(values.toDate).toISOString() : null, // Convert to ISO string if provided
      });
      if (response.data.success) {
        navigate('/admin/user-manager');
        ToastSuccess(response.data.message || 'User created successfully');
      }
    } catch (error) {
      console.error('Form submission error', error);
      ToastError(error.response?.data?.message || 'Failed to create user');
    }
  }

  return (
    <div className="p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
          <h2 className="text-2xl font-bold mb-6 -mt-10 text-center">Create User</h2>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="youremail@example.com" {...field} />
                </FormControl>
                {/* <FormDescription>This is your public display name.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="********" {...field} />
                </FormControl>
                {/* <FormDescription>This is your public display name.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                {/* <FormDescription>This is your public display name.</FormDescription> */}
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
                {/* <FormDescription>The role you want to filter.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          {role === 'vip' && (
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expriry date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" className={'w-full'}>
            Submit
          </Button>
          <Button type="button" variant={'outline'} className={'w-full !border-gray-600'} onClick={() => navigate('/admin/user-manager')}>
            Cancel
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateUserPage;
