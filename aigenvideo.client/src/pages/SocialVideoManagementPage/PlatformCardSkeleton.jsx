import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlatformCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm !py-0">
      <CardHeader className="bg-gray-100 p-4 -mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col min-h-[400px]">
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-4">
            {/* Title & Description Skeleton */}
            <div className="space-y-2">
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Upload Date Skeleton */}
          <div className="flex items-center space-x-1 mb-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
