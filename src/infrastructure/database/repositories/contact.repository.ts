import { IContactIdentifierRepository } from "@application/interfaces/repositories/contact.interface";
import { ContactIdentifier } from "@domain/entities/contact-identifier.entity";
import { IdentifierType } from "../generated/prisma/enums";
import { TransactionClient } from "../generated/prisma/internal/prismaNamespace";
import { PrismaClient } from "../generated/prisma/client";
import prisma from "../prisma/prisma";

export class ContactRepository implements IContactIdentifierRepository {
  private db;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async create(
    data: {
      userId: string;
      identifier: string;
      identifierType: IdentifierType;
    },
    tx?: TransactionClient,
  ): Promise<ContactIdentifier | null> {
    const client = tx ?? this.db;
    const createdContact = await this.db.contactIdentifier.create({
      data: {
        identifier: data.identifier,
        identifierType: data.identifierType,
        userId: data.userId,
      },
    });

    return createdContact;
  }

  async existsByIdentifierAndType(
    identifier: string,
    identifierType: IdentifierType,
  ): Promise<boolean> {
    const count = await this.db.contactIdentifier.count({
      where: {
        identifier,
        identifierType,
      },
    });

    return count > 0;
  }

  async findByIdentifier(
    identifier: string,
  ): Promise<ContactIdentifier | null> {
    const contact = await this.db.contactIdentifier.findFirst({
      where: {
        identifier,
      },
      include: {
        user: true,
      },
    });

    return contact;
  }

  async findByIdentifierAndType(
    identifier: string,
    identifierType: IdentifierType,
  ): Promise<ContactIdentifier | null> {
    const contact = await this.db.contactIdentifier.findFirst({
      where: {
        identifier,
        identifierType,
      },
      include: {
        user: true,
      },
    });

    return contact;
  }

  async deleteContacts(userId: string, tx?: TransactionClient): Promise<void> {
    const client = tx ?? this.db;
    await client.contactIdentifier.deleteMany({
      where: {
        userId,
      },
    });
  }
}

export const contactRepository = new ContactRepository(prisma);
