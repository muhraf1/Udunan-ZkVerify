-- CreateTable
CREATE TABLE "fundraise" (
    "id_fundraise" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "Author" TEXT NOT NULL,

    CONSTRAINT "fundraise_pkey" PRIMARY KEY ("id_fundraise")
);
