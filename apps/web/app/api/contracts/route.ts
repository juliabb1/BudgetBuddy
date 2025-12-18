import { CreateContractDto } from '@repo/shared-types/contract';
import console from 'console';
import { NextRequest, NextResponse } from 'next/server';

const CreateContractSchema = CreateContractDto;

export async function POST(req: NextRequest) {
  console.log('TEST');
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const dto = CreateContractSchema.parse(body);

    // Convert string dates to Date objects for backend
    const contractData = {
      ...dto,
      startDate: dto.startDate,
      endDate: dto.endDate,
    };

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader, // forward the token
        },
        body: JSON.stringify(contractData),
      },
    );

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error('Error creating contract via BFF', err);
    return NextResponse.json(
      { message: 'Failed to create contract' },
      { status: 500 },
    );
  }
}
