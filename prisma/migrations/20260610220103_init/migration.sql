-- CreateTable
CREATE TABLE "Lembrete" (
    "id" SERIAL NOT NULL,
    "mensagem" TEXT NOT NULL,
    "data_agendada" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lembrete_pkey" PRIMARY KEY ("id")
);
