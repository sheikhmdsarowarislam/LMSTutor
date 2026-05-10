import NextAuth, { User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import type { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      avatar?: string
      isVerified: boolean
    }
    accessToken: string
    error?: string
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
    isVerified: boolean
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    avatar?: string
    isVerified: boolean
    accessToken: string
    accessTokenExpiry?: number
    error?: string
  }
}

/**
 * Refreshes the access token using the refresh token from backend cookies
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    console.log("🔄 Attempting to refresh access token...")
    
    const response = await fetch(`${API_URL}/api/v1/user/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ Critical: Include cookies for refresh token
    })

    if (!response.ok) {
      console.error(`❌ Token refresh failed: HTTP ${response.status}`)
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("Error details:", errorData)
      return {
        ...token,
        error: "RefreshAccessTokenError",
      }
    }

    const refreshedTokens = await response.json()

    if (!refreshedTokens.success || !refreshedTokens.data?.accessToken) {
      console.error("❌ Token refresh failed: Invalid response", refreshedTokens)
      return {
        ...token,
        error: "RefreshAccessTokenError",
      }
    }

    console.log("✅ Token refreshed successfully")
    
    return {
      ...token,
      accessToken: refreshedTokens.data.accessToken,
      accessTokenExpiry: Date.now() + 15 * 60 * 1000, // Match backend 15 minute expiry
      error: undefined,
    }
  } catch (error) {
    console.error("❌ Token refresh error:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          
          const res = await fetch(`${API_URL}/api/v1/user/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            credentials: "include", // ✅ Critical: Include cookies for authentication
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const response = await res.json()

          if (!res.ok || !response.success) {
            console.error("Login failed:", response.message)
            throw new Error(response.message || "Authentication failed")
          }

          const { user, accessToken } = response.data || {}

          if (response.success && user && accessToken) {
            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar?.url,
              isVerified: user.isVerified,
              accessToken: accessToken,
            }
          }

          throw new Error("Invalid response from server")
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        // Check if this is a social login (OAuth provider)
        if (account?.provider && account.provider !== "credentials") {
          let retries = 3
          let lastError: Error | null = null

          // Retry mechanism for network failures
          while (retries > 0) {
            try {
              // Extract user data from OAuth profile
              const socialUserData = {
                email: user.email || "",
                name: user.name || "",
                avatar: user.image ? {
                  public_id: `${account.provider}_${user.id}`,
                  url: user.image
                } : undefined
              }


              // Send to backend social-auth endpoint with timeout
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
              const response = await fetch(`${API_URL}/api/v1/user/social-auth`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include", // ✅ Critical: Include cookies for authentication
                body: JSON.stringify(socialUserData),
                signal: controller.signal,
              })

              clearTimeout(timeoutId)
              const result = await response.json()

              if (!response.ok || !result.success) {
                console.error("Social auth backend error:", result.message)
                throw new Error(result.message || "Social authentication failed")
              }

              // Backend returns { user, accessToken, refreshToken }
              const { user: backendUser, accessToken } = result.data

              if (!backendUser || !accessToken) {
                console.error("Invalid backend response: missing user or access token")
                throw new Error("Invalid response from authentication server")
              }

              token.id = backendUser._id
              token.name = backendUser.name
              token.email = backendUser.email
              token.role = backendUser.role
              token.avatar = backendUser.avatar?.url
              token.isVerified = backendUser.isVerified || true
              token.accessToken = accessToken
              token.accessTokenExpiry = Date.now() + 15 * 60 * 1000 // Match backend 15 minute expiry
              
              return token
            } catch (error: any) {
              lastError = error
              retries--
              
              // If it's a validation error or user error, don't retry
              if (error.message?.includes("email") || error.message?.includes("Invalid")) {
                console.error("❌ Social auth validation error, not retrying:", error.message)
                break
              }

              if (retries > 0) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000))
              }
            }
          }

          // All retries failed
          console.error("❌ Social auth failed after all retries:", lastError)
          throw lastError || new Error("Social authentication failed")
        }

        // Regular credentials login
        token.id = user.id
        token.role = user.role
        token.avatar = user.avatar
        token.isVerified = user.isVerified
        token.accessToken = user.accessToken
        token.accessTokenExpiry = Date.now() + 15 * 60 * 1000 // Match backend 15 minute expiry
        return token
      }

      // Check if we need to refresh the token
      const now = Date.now()
      const timeUntilExpiry = token.accessTokenExpiry ? token.accessTokenExpiry - now : 0
      
      // Refresh if token is missing expiry or expires within 5 minutes
      if (!token.accessTokenExpiry || timeUntilExpiry <= 5 * 60 * 1000) {
        if (timeUntilExpiry > 0) {
          console.log(`⏰ Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes, refreshing proactively...`)
        } else {
          console.log("⏰ Token expired, refreshing...")
        }
        return await refreshAccessToken(token)
      }

      // Token is still valid
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.avatar = token.avatar
        session.user.isVerified = token.isVerified
        session.accessToken = token.accessToken
        session.error = token.error
        
        // If there's a refresh error, the session will have an error property
        // This will be checked by the client to trigger re-authentication
      }
      return session
    },
  },
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days - matches backend refresh token duration
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days - JWT token should last as long as the session
  },
  trustHost: true,
})
