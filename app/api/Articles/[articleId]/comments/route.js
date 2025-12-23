import { NextResponse } from 'next/server';

// 1. This function handles POST requests (Creating a comment)
export async function POST(request, { params }) {
  try {
    // Await params (Required in Next.js 15)
    const { articleId } = await params;

    // Parse the data sent from the client
    const body = await request.json();

    console.log(`[API] Creating comment for Article ID: ${articleId}`);

    // Forward to Backend (Port 3000)
    const externalApiUrl = `http://localhost:3000/articles/${articleId}/comments`;
    
    const backendResponse = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new NextResponse(
        JSON.stringify({ message: errorText || 'Backend API error during POST' }), 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    
    // Return the result to the browser
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

// 2. This function handles GET requests (Loading comments)
export async function GET(request, { params }) {
  try {
    // Await params (Required in Next.js 15)
    const { articleId } = await params;
    
    // Forward to Backend (Port 3000)
    const externalApiUrl = `http://localhost:3000/articles/${articleId}/comments`;
    
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