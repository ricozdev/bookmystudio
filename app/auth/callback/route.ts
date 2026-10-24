import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? '/dashboard';
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const destination = new URL(next, origin);
  if (token) destination.searchParams.set('token', token);
  if (email) destination.searchParams.set('email', email);

  return NextResponse.redirect(destination.toString());
}

