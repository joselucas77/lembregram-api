import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mensagem, data_agendada } = body;

    const novoLembrete = await prisma.lembrete.create({
      data: {
        mensagem: mensagem,
        data_agendada: new Date(data_agendada),
      },
    });

    return NextResponse.json(
      { sucesso: true, lembrete: novoLembrete },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { erro: "Falha ao salvar o lembrete" },
      { status: 500 },
    );
  }
}
