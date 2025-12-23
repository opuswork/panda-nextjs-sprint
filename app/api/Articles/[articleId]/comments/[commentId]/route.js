import { NextResponse } from 'next/server';

// 1. DELETE: Handle Deleting a Comment
export async function DELETE(request, { params }) {
  try {
    // Await params (Required in Next.js 15)
    const { articleId, commentId } = await params;
    console.log(`[API] Deleting comment: ${commentId} from article: ${articleId}`);

    // Forward to Backend (Port 3000)
    const externalApiUrl = `http://localhost:3000/articles/${articleId}/comments/${commentId}`;
    
    const backendResponse = await fetch(externalApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new NextResponse(
        JSON.stringify({ message: errorText || 'Backend API error during DELETE' }), 
        { status: backendResponse.status }
      );
    }

    // Handle case where delete returns no content
    const data = await backendResponse.json().catch(() => ({ success: true }));
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// 2. PATCH: Handle Updating a Comment
export async function PATCH(request, { params }) {
  try {
    // Await params (Required in Next.js 15)
    const { articleId, commentId } = await params;
    
    // Get the new content from the request body
    const body = await request.json();

    console.log(`[API] Updating comment: ${commentId} with content: "${body.content}"`);

    // Forward to Backend (Port 3000)
    const externalApiUrl = `http://localhost:3000/articles/${articleId}/comments/${commentId}`;
    
    const backendResponse = await fetch(externalApiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new NextResponse(
        JSON.stringify({ message: errorText || 'Backend API error during PATCH' }), 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}