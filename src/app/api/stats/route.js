import clientPromise from '@/src/lib/mongo';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/src/lib/auth-middleware';

export async function GET(req) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Fetch all data in parallel for better performance
    const [
      posts,
      categories,
      mediaItems,
      users,
      pages,
      apps
    ] = await Promise.all([
      db.collection('posts').find({}).toArray(),
      db.collection('categories').find({}).toArray(),
      db.collection('media').find({}).toArray(),
      db.collection('users').find({}).toArray(),
      db.collection('pages').find({}).toArray(),
      db.collection('apps').find({}).toArray()
    ]);

    // Calculate stats
    const stats = {
      totalPosts: posts.length,
      totalCategories: categories.length,
      totalMediaFiles: mediaItems.length,
      totalUsers: users.length,
      totalPages: pages.length,
      totalApps: apps.length,
      recentPosts: posts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(post => ({
          id: post._id,
          title: post.title,
          createdAt: post.createdAt,
          status: post.status
        })),
      categoryStats: categories.map(category => {
        const categoryPosts = posts.filter(post => 
          post.categoryId === category._id || post.categoryId === category._id.toString()
        );
        return {
          id: category._id,
          name: category.name,
          postCount: categoryPosts.length
        };
      })
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}