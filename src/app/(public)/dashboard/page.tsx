import Link from "next/link"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserToolsServer } from "@/lib/server-api"
import { DashboardToolsList } from "@/components/dashboard/dashboard-tools-list"
import { ErrorBoundary } from "@/components/error-boundary"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sparkles, TrendingUp, ArrowRight, Wrench } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user)        redirect("/signin")
  if (session.error)         redirect("/signin?error=SessionError")
  if (!session.accessToken)  redirect("/signin?error=NoAccessToken")

  return (
    <div className="w-full max-w-6xl py-6 sm:py-8 lg:py-10">

      {/* Welcome Section */}
      <div className="relative mb-8 sm:mb-10 lg:mb-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10 border border-purple-500/20 p-6 sm:p-8 lg:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
                    <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Student Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {session.user.name}
                  </span>!
                </h1>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl">
                  Access your premium tools and supercharge your workflow
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href="/tools">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-200 group">
                    <Wrench className="mr-2 w-4 h-4" />
                    Browse Tools
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <Suspense fallback={<DashboardToolsSkeleton />}>
        <ErrorBoundary>
          <DashboardToolsWrapper />
        </ErrorBoundary>
      </Suspense>

      {/* Explore More */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 group shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
            <div>
              <CardTitle className="text-white text-xl sm:text-2xl font-bold mb-2">Explore More Tools</CardTitle>
              <CardDescription className="text-gray-400">Discover premium tools to boost your productivity</CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400">Premium</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 mb-4 sm:mb-6">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto px-4">
              Browse our collection of premium tools and find the perfect one for your needs
            </p>
            <Link href="/tools">
              <Button variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 group/btn">
                Browse All Tools
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Server Component Wrappers ──────────────────────────────────────────

async function DashboardToolsWrapper() {
  const tools = await getUserToolsServer()
  return (
    <div className="mb-8 sm:mb-10">
      <DashboardToolsList tools={tools} />
    </div>
  )
}

// ── Skeletons ──────────────────────────────────────────────────────────

function DashboardToolsSkeleton() {
  return (
    <div className="mb-8 sm:mb-10 animate-pulse">
      <div className="h-8 w-32 bg-gray-800 rounded mb-4" />
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-900/50 border border-gray-800/50 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export async function generateMetadata() {
  const session = await auth()
  return {
    title: `Dashboard - ${session?.user?.name || "Student"} | Tools Portal`,
    description: "Access your premium tools and manage your subscriptions.",
    robots: { index: false, follow: false },
  }
}