import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Debug: Check what frontend is sending
    console.log("[Proxy] Login attempt:", body.email);

    // Forward request to Backend (Port 3000)
    // Assuming your backend login route is /auth/login
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        data = { message: responseText || "Backend Error" };
    }

    // Forward the backend's response (including the token/user info)
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error("[Proxy] Login Error:", error);
    return NextResponse.json(
        { message: "Cannot connect to Backend Login" }, 
        { status: 500 }
    );
  }
}