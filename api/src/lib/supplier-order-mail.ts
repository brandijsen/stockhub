import { sendTransactionalEmail } from "./mail";

type OrderLineForEmail = {
  code: string;
  name: string;
  qtyOrdered: number;
};

type CheckedLineForEmail = OrderLineForEmail & {
  qtyReceivedActual: number;
  lineConform: boolean;
};

function formatLinesText(lines: OrderLineForEmail[]): string {
  return lines
    .map((line) => `- ${line.code} — ${line.name}: ${line.qtyOrdered} pc`)
    .join("\n");
}

function formatLinesHtml(lines: OrderLineForEmail[]): string {
  const items = lines
    .map(
      (line) =>
        `<li><strong>${line.code}</strong> — ${line.name}: ${line.qtyOrdered} pc</li>`,
    )
    .join("");
  return `<ul style="padding-left:1.25rem;">${items}</ul>`;
}

function formatCheckedLinesText(lines: CheckedLineForEmail[]): string {
  return lines
    .map(
      (line) =>
        `- ${line.code} — ${line.name}: ordered ${line.qtyOrdered}, received ${line.qtyReceivedActual}, conform ${line.lineConform ? "yes" : "no"}`,
    )
    .join("\n");
}

function formatCheckedLinesHtml(lines: CheckedLineForEmail[]): string {
  const items = lines
    .map(
      (line) =>
        `<li><strong>${line.code}</strong> — ${line.name}: ordered ${line.qtyOrdered}, received ${line.qtyReceivedActual}, conform ${line.lineConform ? "yes" : "no"}</li>`,
    )
    .join("");
  return `<ul style="padding-left:1.25rem;">${items}</ul>`;
}

export async function sendSupplierOrderCreatedEmail(params: {
  supplierEmail: string;
  supplierName: string;
  orderCode: string;
  lines: OrderLineForEmail[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const subject = "StockHub — new purchase order";
  const linesText = formatLinesText(params.lines);
  const linesHtml = formatLinesHtml(params.lines);

  const text = `Dear ${params.supplierName},

We are placing a new purchase order (reference ${params.orderCode}).

Ordered items:
${linesText}

The goods are not yet marked as received in our system. We will contact you if anything changes.

Best regards,
StockHub`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
    <p>Dear ${params.supplierName},</p>
    <p>We are placing a new purchase order (reference <strong>${params.orderCode}</strong>).</p>
    <p><strong>Ordered items:</strong></p>
    ${linesHtml}
    <p>The goods are not yet marked as received in our system. We will contact you if anything changes.</p>
    <p>Best regards,<br />StockHub</p>
  </body>
</html>`;

  return sendTransactionalEmail({
    to: params.supplierEmail,
    subject,
    html,
    text,
  });
}

export async function sendSupplierOrderUpdatedEmail(params: {
  supplierEmail: string;
  supplierName: string;
  orderCode: string;
  lines: OrderLineForEmail[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const subject = "StockHub — purchase order updated";
  const linesText = formatLinesText(params.lines);
  const linesHtml = formatLinesHtml(params.lines);

  const text = `Dear ${params.supplierName},

Our purchase order (reference ${params.orderCode}) has been updated.

Revised items:
${linesText}

Please use these quantities as the current request. We will contact you if anything else changes.

Best regards,
StockHub`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
    <p>Dear ${params.supplierName},</p>
    <p>Our purchase order (reference <strong>${params.orderCode}</strong>) has been updated.</p>
    <p><strong>Revised items:</strong></p>
    ${linesHtml}
    <p>Please use these quantities as the current request. We will contact you if anything else changes.</p>
    <p>Best regards,<br />StockHub</p>
  </body>
</html>`;

  return sendTransactionalEmail({
    to: params.supplierEmail,
    subject,
    html,
    text,
  });
}

export async function sendSupplierOrderCancelledEmail(params: {
  supplierEmail: string;
  supplierName: string;
  orderCode: string;
  lines: OrderLineForEmail[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const subject = "StockHub — purchase order cancelled";
  const linesText = formatLinesText(params.lines);
  const linesHtml = formatLinesHtml(params.lines);

  const text = `Dear ${params.supplierName},

We are cancelling purchase order ${params.orderCode}.

Previously requested items:
${linesText}

Please disregard this order. We apologise for any inconvenience.

Best regards,
StockHub`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
    <p>Dear ${params.supplierName},</p>
    <p>We are cancelling purchase order <strong>${params.orderCode}</strong>.</p>
    <p><strong>Previously requested items:</strong></p>
    ${linesHtml}
    <p>Please disregard this order. We apologise for any inconvenience.</p>
    <p>Best regards,<br />StockHub</p>
  </body>
</html>`;

  return sendTransactionalEmail({
    to: params.supplierEmail,
    subject,
    html,
    text,
  });
}

export async function sendSupplierOrderSucceededEmail(params: {
  supplierEmail: string;
  supplierName: string;
  orderCode: string;
  lines: CheckedLineForEmail[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const subject = "StockHub — delivery confirmed";
  const linesText = formatCheckedLinesText(params.lines);
  const linesHtml = formatCheckedLinesHtml(params.lines);

  const text = `Dear ${params.supplierName},

Thank you for order ${params.orderCode}. We have received the goods and confirmed that everything matches our expectations.

Received items:
${linesText}

Best regards,
StockHub`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
    <p>Dear ${params.supplierName},</p>
    <p>Thank you for order <strong>${params.orderCode}</strong>. We have received the goods and confirmed that everything matches our expectations.</p>
    <p><strong>Received items:</strong></p>
    ${linesHtml}
    <p>Best regards,<br />StockHub</p>
  </body>
</html>`;

  return sendTransactionalEmail({
    to: params.supplierEmail,
    subject,
    html,
    text,
  });
}

export async function sendSupplierOrderDoneEmail(params: {
  supplierEmail: string;
  supplierName: string;
  orderCode: string;
  lines: CheckedLineForEmail[];
  adminCloseNote: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const subject = "StockHub — delivery issue reported";
  const linesText = formatCheckedLinesText(params.lines);
  const linesHtml = formatCheckedLinesHtml(params.lines);

  const text = `Dear ${params.supplierName},

We have reviewed order ${params.orderCode} and found discrepancies during warehouse checking.

Issue note:
${params.adminCloseNote}

Checked items:
${linesText}

Please contact us so we can resolve the situation.

Best regards,
StockHub`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
    <p>Dear ${params.supplierName},</p>
    <p>We have reviewed order <strong>${params.orderCode}</strong> and found discrepancies during warehouse checking.</p>
    <p><strong>Issue note:</strong></p>
    <p>${params.adminCloseNote}</p>
    <p><strong>Checked items:</strong></p>
    ${linesHtml}
    <p>Please contact us so we can resolve the situation.</p>
    <p>Best regards,<br />StockHub</p>
  </body>
</html>`;

  return sendTransactionalEmail({
    to: params.supplierEmail,
    subject,
    html,
    text,
  });
}
