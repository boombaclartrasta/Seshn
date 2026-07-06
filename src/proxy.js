import { NextResponse } from "next/server"

const ACCESS_COOKIE = "seshn_prototype_access"

export function proxy(request) {
  const token = process.env.PROTOTYPE_ACCESS_TOKEN

  if (!token) {
    return process.env.NODE_ENV === "production"
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next()
  }

  const url = request.nextUrl.clone()
  const accessToken = url.searchParams.get("access")
  const cookieToken = request.cookies.get(ACCESS_COOKIE)?.value

  if (accessToken === token) {
    url.searchParams.delete("access")

    const response = NextResponse.redirect(url)
    response.cookies.set(ACCESS_COOKIE, token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  }

  if (cookieToken === token) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL("/", request.url))
}

export const config = {
  matcher: [
    "/signin/:path*",
    "/dashboard/:path*",
    "/sessions/:path*",
    "/share/:path*",
  ],
}
