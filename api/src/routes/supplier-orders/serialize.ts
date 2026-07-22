import type {
  Article,
  Supplier,
  SupplierOrder,
  SupplierOrderLine,
  User,
} from "@prisma/client";

export type SerializedSupplierOrderLine = {
  id: string;
  articleId: string;
  qtyOrdered: number;
  qtyReceivedActual: number | null;
  lineConform: boolean | null;
  article: {
    id: string;
    code: string;
    name: string;
    stock: number;
    minThreshold: number;
    lowStock: boolean;
  };
};

export type SerializedSupplierOrderUser = {
  id: string;
  name: string;
  email: string;
};

export type SerializedSupplierOrder = {
  id: string;
  status: string;
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  createdBy: SerializedSupplierOrderUser;
  lines: SerializedSupplierOrderLine[];
  lineCount: number;
  totalQtyOrdered: number;
  checkedAt: string | null;
  closedAt: string | null;
  adminCloseNote: string | null;
  closedBy: SerializedSupplierOrderUser | null;
  createdAt: string;
  updatedAt: string;
};

type OrderLineWithArticle = SupplierOrderLine & {
  article: Pick<
    Article,
    "id" | "code" | "name" | "stock" | "minThreshold"
  >;
};

export type SupplierOrderWithRelations = SupplierOrder & {
  supplier: Supplier;
  createdBy: Pick<User, "id" | "firstName" | "lastName" | "email">;
  closedBy: Pick<User, "id" | "firstName" | "lastName" | "email"> | null;
  lines: OrderLineWithArticle[];
};

export const supplierOrderInclude = {
  supplier: true,
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  closedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  lines: {
    include: {
      article: {
        select: {
          id: true,
          code: true,
          name: true,
          stock: true,
          minThreshold: true,
        },
      },
    },
    orderBy: { article: { code: "asc" } },
  },
} as const;

function userDisplayName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

function serializeLine(line: OrderLineWithArticle): SerializedSupplierOrderLine {
  return {
    id: line.id,
    articleId: line.articleId,
    qtyOrdered: line.qtyOrdered,
    qtyReceivedActual: line.qtyReceivedActual,
    lineConform: line.lineConform,
    article: {
      id: line.article.id,
      code: line.article.code,
      name: line.article.name,
      stock: line.article.stock,
      minThreshold: line.article.minThreshold,
      lowStock: line.article.stock < line.article.minThreshold,
    },
  };
}

export function serializeSupplierOrder(
  order: SupplierOrderWithRelations,
): SerializedSupplierOrder {
  const lines = order.lines.map(serializeLine);
  const totalQtyOrdered = lines.reduce((sum, line) => sum + line.qtyOrdered, 0);

  return {
    id: order.id,
    status: order.status,
    supplier: {
      id: order.supplier.id,
      name: order.supplier.name,
      email: order.supplier.email,
      phone: order.supplier.phone,
    },
    createdBy: {
      id: order.createdBy.id,
      name: userDisplayName(order.createdBy),
      email: order.createdBy.email,
    },
    lines,
    lineCount: lines.length,
    totalQtyOrdered,
    checkedAt: order.checkedAt?.toISOString() ?? null,
    closedAt: order.closedAt?.toISOString() ?? null,
    adminCloseNote: order.adminCloseNote,
    closedBy: order.closedBy
      ? {
          id: order.closedBy.id,
          name: userDisplayName(order.closedBy),
          email: order.closedBy.email,
        }
      : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}
