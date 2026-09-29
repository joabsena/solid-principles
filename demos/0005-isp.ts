// demos/0005-isp.ts — Interface Segregation Principle
// Run: npm run demo:isp

export {};

type Document = { title: string; body: string };

// ❌ One broad contract forces a basic printer to fake capabilities.
interface OfficeMachine {
  print(document: Document): void;
  scan(): string;
  fax(number: string, document: Document): void;
}

class BasicPrinter implements OfficeMachine {
  print(document: Document): void {
    console.log(`Printed: ${document.title}`);
  }

  scan(): string {
    throw new Error('Scanning is not supported');
  }

  fax(_number: string, _document: Document): void {
    throw new Error('Faxing is not supported');
  }
}

function printInvoiceUsingBroadContract(machine: OfficeMachine, invoice: Document): void {
  machine.print(invoice);
}

// ✅ Consumers depend only on the capability they need.
interface Printer {
  print(document: Document): void;
}

interface Scanner {
  scan(): string;
}

interface Fax {
  fax(number: string, document: Document): void;
}

function printInvoice(printer: Printer, invoice: Document): void {
  printer.print(invoice);
}

class SimplePrinter implements Printer {
  print(document: Document): void {
    console.log(`Printed: ${document.title}`);
  }
}

class MultiFunctionDevice implements Printer, Scanner, Fax {
  print(document: Document): void {
    console.log(`Printed: ${document.title}`);
  }

  scan(): string {
    return 'scanned-document';
  }

  fax(number: string, document: Document): void {
    console.log(`Faxed ${document.title} to ${number}`);
  }
}

const invoice = { title: 'Invoice #42', body: 'Amount due: $19.90' };
printInvoiceUsingBroadContract(new BasicPrinter(), invoice);
printInvoice(new SimplePrinter(), invoice);
printInvoice(new MultiFunctionDevice(), invoice);
