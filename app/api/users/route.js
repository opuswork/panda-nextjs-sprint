import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Debug: Check what we are sending
    console.log("[Proxy] Sending to backend:", body); 

    // Forward to Backend (Port 3000)
    const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Smart Error Handling: Get text first, then try to parse JSON
    // This prevents the "500 Internal Server Error" crash
    const responseText = await res.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.log("[Proxy] Backend sent non-JSON response:", responseText);
        data = { message: responseText || "Unknown Backend Error" };
    }

    // Return the EXACT status code from the backend (400, 409, etc.)
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error("[Proxy] Connection Failed:", error);
    return NextResponse.json(
        { message: "Cannot connect to Backend (Port 3000)" }, 
        { status: 500 }
    );
  }
}