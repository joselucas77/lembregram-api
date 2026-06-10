import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Busca no banco todos os lembretes 'pendentes' cuja data já passou do momento atual
    const agora = new Date();
    const pendentes = await prisma.lembrete.findMany({
      where: {
        status: "pendente",
        data_agendada: { lte: agora }, // "lte" significa Less Than or Equal (Menor ou Igual a agora)
      },
    });

    // Se não tiver nada, encerra silenciosamente
    if (pendentes.length === 0) {
      return NextResponse.json({
        mensagem: "Nenhum lembrete para enviar agora.",
      });
    }

    // Pega as chaves do .env
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // 2. Loop: Envia cada mensagem atrasada para o Telegram
    for (const lembrete of pendentes) {
      const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

      const telegramResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `⏰ *LembreGram:*\n${lembrete.mensagem}`,
          parse_mode: "Markdown",
        }),
      });

      // 3. Se o Telegram confirmou o recebimento, atualizamos o banco para não enviar de novo
      if (telegramResponse.ok) {
        await prisma.lembrete.update({
          where: { id: lembrete.id },
          data: { status: "enviado" },
        });
      }
    }

    return NextResponse.json({ sucesso: true, enviados: pendentes.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { erro: "Falha ao executar o cron" },
      { status: 500 },
    );
  }
}
