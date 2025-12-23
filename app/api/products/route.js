// /app/api/products/route.js (App Router Proxy)

import { NextResponse } from 'next/server';

// This function handles GET requests to /api/products
export async function GET(request) {
  try {
    // 1. Extract query parameters from the request
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const orderBy = searchParams.get('orderBy') || 'recent';
    const keyword = searchParams.get('keyword') || '';
    
    // 2. Build the external API URL with query parameters
    const externalApiUrl = new URL('http://localhost:3000/products');
    externalApiUrl.searchParams.set('page', page);
    externalApiUrl.searchParams.set('pageSize', pageSize);
    if (orderBy) {
      externalApiUrl.searchParams.set('orderBy', orderBy);
    }
    if (keyword) {
      externalApiUrl.searchParams.set('keyword', keyword);
    }
    
    console.log('[API Route] Fetching from backend:', externalApiUrl.toString());
    
    // 3. Fetch data from your separate backend server on port 3000
    const backendResponse = await fetch(externalApiUrl.toString()); 
    
    // Check if the backend response was successful
    if (!backendResponse.ok) {
      // Return the backend's status/error to the client
      return new NextResponse(
        JSON.stringify({ message: 'Backend API error during fetch' }), 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    
    // 4. Return the data back to the Next.js frontend component
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Proxy fetch failed:", error);
    // 5. Return a generic server error if the fetch itself failed
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error in Next.js proxy' }), 
      { status: 500 }
    );
  }
}

// This function handles POST requests to /api/products
export async function POST(request) {
  try {
    // 1. Get the request body
    const body = await request.json();
    
    // 2. Forward the POST request to your separate backend server on port 3000
    const externalApiUrl = 'http://localhost:3000/products';
    
    const backendResponse = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Check if the backend response was successful
    if (!backendResponse.ok) {
      // Return the backend's status/error to the client
      const errorText = await backendResponse.text();
      return new NextResponse(
        JSON.stringify({ message: errorText || 'Backend API error during POST' }), 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    
    // 3. Return the data back to the Next.js frontend component
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error("Proxy POST failed:", error);
    // 4. Return a generic server error if the fetch itself failed
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error in Next.js proxy' }), 
      { status: 500 }
    );
  }
}