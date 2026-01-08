import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px] bg-zinc-800" />
        <Skeleton className="h-4 w-[350px] bg-zinc-800" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px] bg-zinc-800" />
              <Skeleton className="h-5 w-5 bg-zinc-800 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] bg-zinc-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <Skeleton className="h-6 w-[150px] bg-zinc-800" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-800" />
        </CardContent>
      </Card>
    </div>
  )
}
