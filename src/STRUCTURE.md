# `src/` Structure Guide (AI-Oriented)

This document explains how the backend code is organized so an AI agent can safely plan and implement features by placing changes in the correct layer.

## High-level architecture

The project follows a layered architecture with dependency direction from outer layers toward inner abstractions:

- `presentation` handles HTTP transport concerns (routes, controllers, validators).
- `application` contains use-case orchestration and business workflows.
- `domain` contains core entities and domain behavior.
- `infrastructure` provides concrete implementations (database, middleware, external services, configs).
- `shared` stores cross-cutting helpers, error types, and reusable utilities.

Entry flow is:
`server.ts` -> `app.ts` -> `presentation/routes/route.ts` -> controller -> use case -> repository/service interface + implementation -> persistence/external API.

## Folder-by-folder map

### `src/server.ts`

- Process bootstrap/startup (server launch).
- Keep this file thin; app composition belongs in `app.ts`.

### `src/app.ts`

- Express app setup.
- Global middleware (`helmet`, `cors`, body parsers).
- API mount point (`/api`) and health endpoint.
- Global error handling registration.

### `src/presentation/`

HTTP interface layer.

- `routes/`
  - Route grouping and endpoint definitions.
  - Connect middleware + controller handlers.
  - `route.ts` is the top-level route aggregator.
- `controllers/`
  - Parse request inputs, call use cases, shape HTTP responses.
  - No database logic or heavy business rules here.
- `validators/`
  - Request validation schemas/rules used by routes/controllers.

### `src/application/`

Business use-case layer and contracts.

- `interfaces/`
  - Contracts for dependencies (repositories/services).
  - `interfaces/repositories/*.interface.ts`: persistence contracts.
  - `interfaces/services/*.interface.ts`: external service contracts (email, etc).
- `use-cases/`
  - One file per business action, grouped by domain (`user/`, `friendship/`, `common/`).
  - Orchestrates domain logic + interfaces.
  - Should depend on interfaces and domain types, not framework-specific HTTP objects.

### `src/domain/`

Core model layer.

- `entities/`
  - Domain entities and model behavior (`user`, `friendship`, `otp-verification`, etc).
  - Keep framework and transport concerns out of this layer.

### `src/infrastructure/`

Technical implementations and adapters.

- `config/`
  - External/config integration setup (Prisma, OAuth, Cloudinary).
- `database/`
  - `prisma/`: schema, client setup, migrations.
  - `repositories/`: concrete implementations of application repository interfaces.
- `middleware/`
  - Express middleware (`authenticate`, `validator`, `upload`, `errorHandler`).
- `services/`
  - External integrations (email/cloudinary) and implementation details/templates.

### `src/shared/`

Cross-layer utilities and common types.

- `error/`
  - Shared error classes (`AppError`).
- `utils/`
  - Reusable utility logic (token, password, logger).
- `types/`
  - Shared TS types (e.g., request typing).
- `functions.ts`
  - Generic helper functions reused in multiple places.

## Dependency rules (important for AI changes)

Preferred dependency direction:

- `presentation` -> `application` -> `domain`
- `application` -> `application/interfaces` + `domain` + `shared`
- `infrastructure` implements `application/interfaces`
- `shared` may be used by all layers (for generic utilities only)

Avoid:

- `domain` importing `infrastructure` or `presentation`
- Controllers directly querying Prisma/repositories
- Routes containing business logic

## Where to add files for a new feature

When adding a new feature (example: "groups"), follow this checklist:

1. **Domain model**
   - Add or update entity in `domain/entities/`.
2. **Application contracts**
   - Add repository/service interfaces in `application/interfaces/...` if new dependencies are needed.
3. **Use case**
   - Add use-case file(s) in `application/use-cases/<feature>/`.
   - Inject interfaces, orchestrate workflow, enforce business rules.
4. **Infrastructure implementations**
   - Add repository implementations in `infrastructure/database/repositories/`.
   - Add external service implementations in `infrastructure/services/` if required.
   - Update Prisma schema/migrations under `infrastructure/database/prisma/` when persistence changes.
5. **Presentation layer**
   - Add controller methods in `presentation/controllers/`.
   - Add or update route files in `presentation/routes/`.
   - Register new route group in `presentation/routes/route.ts` if needed.
   - Add validators in `presentation/validators/` for new request shapes.
6. **Shared updates**
   - Add cross-cutting helpers/types only when truly reusable in `shared/`.

## Modify-vs-create guidance

- **Change only API shape/endpoint wiring** -> `presentation/routes`, `presentation/controllers`, `presentation/validators`.
- **Change business behavior** -> `application/use-cases` (+ maybe `domain/entities`).
- **Change persistence strategy or DB access** -> `application/interfaces/repositories` + `infrastructure/database/repositories` (+ Prisma files).
- **Add external provider integration** -> `application/interfaces/services` + `infrastructure/services` (+ `infrastructure/config` if setup needed).
- **Add generic utility used by multiple features** -> `shared/utils` or `shared/types`.

## Naming and placement conventions

- Use-case files: `<action>.usecase.ts` (grouped under `use-cases/<feature>/`).
- Repository interface files: `<feature>.interface.ts`.
- Repository implementation files: `<feature>.repository.ts`.
- Entity files: `<feature>.entity.ts`.
- Route files: `<feature>.route.ts`.
- Keep one primary responsibility per file.

Note: this codebase already contains a few legacy filename inconsistencies (for example, `*.usercase.ts`). Prefer following the dominant convention (`*.usecase.ts`) for new files unless you are intentionally matching existing imports in a specific module.

## Concrete example from current codebase (`user`)

Use the existing `user` flow as the reference standard for how layers connect.

### 1) Domain entity

- File: `domain/entities/user.entity.ts`
- Purpose: core user model and domain methods (`setPassword`, `setAvatar`, etc).

### 2) Application repository interface

- File: `application/interfaces/repositories/user.interface.ts`
- Pattern: define contract methods that use-cases rely on.

```ts
export interface IUserRepository {
  create(user: User, tx?: PrismaClient): Promise<User>;
  update(user: User, tx?: PrismaClient): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
}
```

### 3) Infrastructure repository implementation

- File: `infrastructure/database/repositories/user.repository.ts`
- Pattern: class implements `IUserRepository` and translates between DB rows and domain entity.

```ts
class UserRepository implements IUserRepository {
  async create(user: User, tx?: PrismaClient): Promise<User> {
    // map domain -> prisma create
  }
}

export const userRepository = new UserRepository();
```

### 4) Use case orchestrating business flow

- File: `application/use-cases/user/signup.usecase.ts`
- Pattern: inject interfaces + services, then coordinate validation, persistence, side effects, and response payload.

```ts
export class SignUpUsecase {
  constructor(
    private userRepository: IUserRepository,
    private contactRepository: IContactIdentifierRepository,
    private emailService: IEmailService,
    private db: PrismaClient,
  ) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    // business checks -> transaction -> otp + token generation
  }
}
```

### 5) Controller using use case

- File: `presentation/controllers/user.controller.ts`
- Pattern: parse request -> call use case -> send HTTP response.

```ts
static async signup(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await signUpUseCase.execute(input);
  res.status(201).json({ success: true, data: { accessToken, refreshToken, user } });
}
```

### 6) Route wiring

- Files: `presentation/routes/auth.route.ts`, `presentation/routes/user.route.ts`, `presentation/routes/route.ts`
- Pattern: route file binds endpoint to controller; root `route.ts` mounts group.

```ts
router.use("/auth", AuthRouter);
router.use("/user", UserRouter);
```

### Example feature checklist (copy this pattern)

For a new feature like `group`, mirror the `user` structure:

1. `domain/entities/group.entity.ts`
2. `application/interfaces/repositories/group.interface.ts`
3. `infrastructure/database/repositories/group.repository.ts`
4. `application/use-cases/group/<action>.usecase.ts`
5. `presentation/controllers/group.controller.ts`
6. `presentation/routes/group.route.ts`
7. register in `presentation/routes/route.ts`

## Practical implementation path for AI agents

For most feature work, execute in this order:

1. Define/extend entity.
2. Define interface contract.
3. Implement use case.
4. Implement infrastructure repository/service.
5. Wire controller + route.
6. Add validation and error handling touchpoints.
7. Update schema/migrations if needed.
8. Verify route registration and app wiring.

This sequence minimizes cross-layer coupling mistakes and keeps changes aligned with the current project architecture.
