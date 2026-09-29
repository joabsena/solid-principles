// demos/0002-ocp.ts — Open-Closed Principle: before and after
// Run: npx tsx demos/0002-ocp.ts

export {};

type PaymentRequest = { amountInCents: number; token: string };

// ❌ BEFORE: every new provider changes this stable coordinator.
class PaymentProcessor {
  async charge(provider: string, request: PaymentRequest): Promise<string> {
    if (provider === 'card') {
      return `card:${request.amountInCents}:${request.token}`;
    }

    if (provider === 'pix') {
      return `pix:${request.amountInCents}:${request.token}`;
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ✅ AFTER: the coordinator is closed; new methods are extensions.
interface PaymentMethod {
  charge(request: PaymentRequest): Promise<string>;
}

class CardPayment implements PaymentMethod {
  async charge(request: PaymentRequest): Promise<string> {
    return `card:${request.amountInCents}:${request.token}`;
  }
}

class PixPayment implements PaymentMethod {
  async charge(request: PaymentRequest): Promise<string> {
    return `pix:${request.amountInCents}:${request.token}`;
  }
}

class Checkout {
  constructor(private readonly payment: PaymentMethod) {}

  pay(request: PaymentRequest): Promise<string> {
    return this.payment.charge(request);
  }
}

async function main() {
  const request = { amountInCents: 1_990, token: 'order-42' };

  console.log('❌ BEFORE: adding a provider edits PaymentProcessor');
  console.log(await new PaymentProcessor().charge('card', request));

  console.log('\n✅ AFTER: adding a provider creates a PaymentMethod');
  console.log(await new Checkout(new CardPayment()).pay(request));
  console.log(await new Checkout(new PixPayment()).pay(request));
}

main().catch(console.error);
