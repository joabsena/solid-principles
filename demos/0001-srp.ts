// demos/0001-srp.ts — Single Responsibility Principle: before and after
// Run: npx tsx demos/0001-srp.ts

export {};

// ============================================================
// ❌ BEFORE: One class, three reasons to change
// ============================================================

interface User {
  id: string;
  email: string;
  name: string;
}

class Database {
  async create(_table: string, _data: Record<string, unknown>): Promise<User> {
    return { id: 'u1', email: 'alice@example.com', name: 'Alice' };
  }
}

// Mock mailer and logger
const mailer = {
  send: async (_opts: { to: string; template: string }) => {
    console.log('  ✉  Email sent to', _opts.to);
  },
};

const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log('  📋 LOG:', msg, meta ?? '');
  },
};

// --- BAD: UserService mixes three concerns ---
class UserService {
  constructor(private db: Database) {}

  async register(email: string, name: string): Promise<User> {
    const user = await this.db.create('user', { email, name });
    await this.sendWelcomeEmail(user.email);
    this.logActivity('user.registered', user.id);
    return user;
  }

  // Concern #2: email delivery (Marketing team)
  async sendWelcomeEmail(to: string): Promise<void> {
    await mailer.send({ to, template: 'welcome' });
  }

  // Concern #3: audit logging (SRE team)
  private logActivity(event: string, userId: string): void {
    logger.info(event, { userId });
  }
}

// ============================================================
// ✅ AFTER: One responsibility per class
// ============================================================

interface INotificationService {
  userRegistered(user: User): Promise<void>;
}

class EmailNotificationService implements INotificationService {
  async userRegistered(user: User): Promise<void> {
    await mailer.send({ to: user.email, template: 'welcome' });
  }
}

class ObservabilityService {
  logUserCreated(userId: string): void {
    logger.info('user.registered', { userId });
  }
}

interface IUserRepository {
  create(data: { email: string; name: string }): Promise<User>;
}

class UserRepository implements IUserRepository {
  constructor(private db: Database) {}
  async create(data: { email: string; name: string }): Promise<User> {
    return this.db.create('user', data);
  }
}

// This class has ONE reason to change: Product changes registration flow
class RegisterUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private notifier: INotificationService,
    private observability: ObservabilityService,
  ) {}

  async execute(email: string, name: string): Promise<User> {
    const user = await this.userRepo.create({ email, name });
    await this.notifier.userRegistered(user);
    this.observability.logUserCreated(user.id);
    return user;
  }
}

// ============================================================
// Run both and compare
// ============================================================

async function main() {
  const db = new Database();

  console.log('╔══════════════════════════════════════╗');
  console.log('║  ❌ BEFORE: UserService (SRP violation)  ║');
  console.log('╚══════════════════════════════════════╝');
  const badService = new UserService(db);
  await badService.register('alice@example.com', 'Alice');

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  ✅ AFTER: UseCase + injected services  ║');
  console.log('╚══════════════════════════════════════╝');
  const userRepo = new UserRepository(db);
  const notifier = new EmailNotificationService();
  const observability = new ObservabilityService();
  const useCase = new RegisterUserUseCase(userRepo, notifier, observability);
  await useCase.execute('bob@example.com', 'Bob');
}

main().catch(console.error);
