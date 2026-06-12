import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const agora = new Date();
    const pendentes = await prisma.lembrete.findMany({
      where: {
        status: "pendente",
        data_agendada: { lte: agora },
      },
    });

    if (pendentes.length === 0) {
      return NextResponse.json({
        mensagem: "Nenhum lembrete para enviar agora.",
      });
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // envia cada mensagem atrasada para o Telegram
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
