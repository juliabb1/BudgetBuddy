import { UpdateContractDto } from '@repo/shared-types/contract';
import console from 'console';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const { id } = params;

    const body = await req.json();
    const dto = UpdateContractDto.parse(body);
    const contractData = dto;

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(contractData),
      },
    );

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error('Error updating contract via BFF', err);
    return NextResponse.json(
      { message: 'Failed to update contract' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const { id } = params;

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: authHeader,
        },
      },
    );

    if (!backendRes.ok) {
      const errorData = await backendRes.json();
      return NextResponse.json(errorData, { status: backendRes.status });
    }

    return NextResponse.json(
      { message: 'Contract deleted successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error deleting contract via BFF', err);
    return NextResponse.json(
      { message: 'Failed to delete contract' },
      { status: 500 },
    );
  }
}
