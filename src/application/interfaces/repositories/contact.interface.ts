import { ContactIdentifier } from "@domain/entities/contact-identifier.entity";
import { IdentifierType } from "@infrastructure/database/generated/prisma/enums";
import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";

type CreateInput = {
  userId: string;
  identifier: string;
  identifierType: IdentifierType;
};

export interface IContactIdentifierRepository {
  create(
    data: CreateInput,
    tx?: TransactionClient,
  ): Promise<ContactIdentifier | null>;
  existsByIdentifierAndType(
    identifier: string,
    identifierType: IdentifierType,
  ): Promise<boolean>;
  findByIdentifierAndType(
    identifier: string,
    identifierType: IdentifierType,
  ): Promise<ContactIdentifier | null>;
  findByIdentifier(identifier: string): Promise<ContactIdentifier | null>;
  deleteContacts(userId: string, tx?: TransactionClient): Promise<void>;
  // findByEmailOrPhoneIdentifier(
  //   identifier: string,
  //   identifierType: IdentifierType,
  // ): Promise<ContactIdentifier | null>;
}
