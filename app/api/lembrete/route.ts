import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Lê o que o aplicativo mandou
    const body = await request.json();
    const { mensagem, data_agendada } = body;

    // 2. Salva no banco de dados (Neon) via Prisma
    const novoLembrete = await prisma.lembrete.create({
      data: {
        mensagem: mensagem,
        data_agendada: new Date(data_agendada), // Converte o texto para formato de Data
      },
    });

    // 3. Responde para o celular que deu tudo certo
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
