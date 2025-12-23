import { NextResponse } from 'next/server';

// PATCH: Forward update request to external backend
export async function PATCH(request, { params }) {
  try {
    // ✅ FIX: Await params before destructuring (Required in Next.js 15)
    const { userId } = await params;
    
    // 1. Get the request body
    const body = await request.json();
    
    // 2. Forward the PATCH request to your separate backend server on port 3000
    const externalApiUrl = `http://localhost:3000/users/${userId}`;
    
    const backendResponse = await fetch(externalApiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Check if the backend response was successful
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new NextResponse(
        JSON.stringify({ message: errorText || 'Backend API error during PATCH' }), 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    
    // 3. Return the data back to the Next.js frontend component
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Proxy PATCH failed:", error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error in Next.js proxy' }), 
      { status: 500 }
    );
  }
}

// DELETE: Forward delete request to external backend
export async function DELETE(request, { params }) {
  try {
    // ✅ FIX: Await params here too
    const { userId } = await params;
    
    // 1. Forward the DELETE request to your separate backend server on port 3000
    const externalApiUrl = `http://localhost:3000/users/${userId}`;
    
    const backendResponse = await fetch(externalApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if the backend response was successful
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new NextResponse(
        JSON.stringify({ message: errorText || 'Backend API error during DELETE' }), 
        { status: backendResponse.status }
      );
    }

    // Handle case where delete returns no content
    const data = await backendResponse.json().catch(() => ({}));
    
    // 3. Return the data back to the Next.js frontend component
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Proxy DELETE failed:", error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error in Next.js proxy' }), 
      { status: 500 }
    );
  }
}

// GET: Forward fetch request to external backend
export async function GET(request, { params }) {
    try {
      // ✅ This was already correct in your code!
      const { userId } = await params;
      
      const externalApiUrl = `http://localhost:3000/users/${userId}`;
      
      const backendResponse = await fetch(externalApiUrl);
      
      if (!backendResponse.ok) {
        return new NextResponse(
          JSON.stringify({ message: 'Backend API error during fetch' }), 
          { status: backendResponse.status }
        );
      }
  
      const data = await backendResponse.json();
      
      return NextResponse.json(data, { status: 200 });
  
    } catch (error) {
      console.error("Proxy GET failed:", error);
      return new NextResponse(
        JSON.stringify({ message: 'Internal Server Error in Next.js proxy' }), 
        { status: 500 }
      );
    }
  }