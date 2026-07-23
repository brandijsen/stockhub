import type {
  Article,
  Customer,
  CustomerOrder,
  CustomerOrderLine,
  User,
} from "@prisma/client";

export type SerializedCustomerOrderLine = {
  id: string;
  articleId: string;
  quantity: number;
  article: {
    id: string;
    code: string;
    name: string;
    stock: number;
  };
};

export type SerializedCustomerOrderUser = {
  id: string;
  name: string;
  email: string;
};

export type SerializedCustomerOrder = {
  id: string;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  createdBy: SerializedCustomerOrderUser;
  lines: SerializedCustomerOrderLine[];
  lineCount: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
};

type OrderLineWithArticle = CustomerOrderLine & {
  article: Pick<Article, "id" | "code" | "name" | "stock">;
};

export type CustomerOrderWithRelations = CustomerOrder & {
  customer: Pick<Customer, "id" | "name" | "email" | "phone">;
  createdBy: Pick<User, "id" | "firstName" | "lastName" | "email">;
  lines: OrderLineWithArticle[];
};

function serializeUser(
  user: Pick<User, "id" | "firstName" | "lastName" | "email">,
): SerializedCustomerOrderUser {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
  };
}

export function serializeCustomerOrder(
  order: CustomerOrderWithRelations,
): SerializedCustomerOrder {
  const lines: SerializedCustomerOrderLine[] = order.lines.map((line) => ({
    id: line.id,
    articleId: line.articleId,
    quantity: line.quantity,
    article: {
      id: line.article.id,
      code: line.article.code,
      name: line.article.name,
      stock: line.article.stock,
    },
  }));

  return {
    id: order.id,
    status: order.status,
    customer: {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    createdBy: serializeUser(order.createdBy),
    lines,
    lineCount: lines.length,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export const customerOrderInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  createdBy: {
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
        },
      },
    },
    orderBy: { article: { code: "asc" } },
  },
} as const;
