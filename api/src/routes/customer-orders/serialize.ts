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
  code: string;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
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
  customer: Pick<Customer, "id" | "name" | "email" | "phone" | "address">;
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
    code: order.code,
    status: order.status,
    customer: {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      address: order.customer.address,
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
      address: true,
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

export type SerializedCustomerOrderListItem = {
  id: string;
  code: string;
  status: string;
  customer: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  lineCount: number;
  totalQuantity: number;
  createdAt: string;
};

type CustomerOrderListWithRelations = CustomerOrder & {
  customer: Pick<Customer, "id" | "name">;
  createdBy: Pick<User, "id" | "firstName" | "lastName">;
  lines: Pick<CustomerOrderLine, "quantity">[];
};

export const customerOrderListInclude = {
  customer: {
    select: {
      id: true,
      name: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  lines: {
    select: {
      quantity: true,
    },
  },
} as const;

export function serializeCustomerOrderListItem(
  order: CustomerOrderListWithRelations,
): SerializedCustomerOrderListItem {
  const totalQuantity = order.lines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );

  return {
    id: order.id,
    code: order.code,
    status: order.status,
    customer: {
      id: order.customer.id,
      name: order.customer.name,
    },
    createdBy: {
      id: order.createdBy.id,
      name: `${order.createdBy.firstName} ${order.createdBy.lastName}`.trim(),
    },
    lineCount: order.lines.length,
    totalQuantity,
    createdAt: order.createdAt.toISOString(),
  };
}
