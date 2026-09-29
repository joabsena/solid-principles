// demos/0003-srp-functional.ts — SRP with functional TypeScript
// Run: npx tsx demos/0003-srp-functional.ts

export {};

type OrderItem = { priceInCents: number; quantity: number };
type Order = { id: string; customerEmail: string; items: OrderItem[] };
type PricedOrder = Order & { totalInCents: number };

// ❌ BEFORE: one function mixes rules and effects owned by different actors.
async function placeOrderBad(order: Order): Promise<void> {
  const total = order.items.reduce(
    (sum, item) => sum + item.priceInCents * item.quantity,
    0,
  );

  await database.save({ ...order, totalInCents: total }); // persistence concern
  await email.send(order.customerEmail, `Order total: ${total}`); // notification concern
  logger.info('order.placed', { orderId: order.id, total }); // observability concern
}

// ✅ AFTER: pure rules are small and effects are explicit dependencies.
const calculateTotal = (items: OrderItem[]): number =>
  items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);

const priceOrder = (order: Order): PricedOrder => ({
  ...order,
  totalInCents: calculateTotal(order.items),
});

type Effects = {
  save: (order: PricedOrder) => Promise<void>;
  notify: (email: string, message: string) => Promise<void>;
  audit: (event: string, data: Record<string, unknown>) => void;
};

const placeOrder = (effects: Effects) => async (order: Order): Promise<void> => {
  const priced = priceOrder(order);
  await effects.save(priced);
  await effects.notify(priced.customerEmail, `Order total: ${priced.totalInCents}`);
  effects.audit('order.placed', { orderId: priced.id, total: priced.totalInCents });
};

// Infrastructure is supplied at the composition boundary.
const database = { save: async (_order: PricedOrder) => undefined };
const email = { send: async (_to: string, _message: string) => undefined };
const logger = { info: (_event: string, _data: Record<string, unknown>) => console.log(`LOG: ${_event}`) };

const run = placeOrder({
  save: database.save,
  notify: email.send,
  audit: logger.info,
});

run({
  id: 'order-42',
  customerEmail: 'alice@example.com',
  items: [{ priceInCents: 1_990, quantity: 2 }],
}).catch(console.error);
