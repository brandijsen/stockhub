export type PartyRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  orderCount: number;
};

export type PartyFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type PartyListCopy = {
  title: string;
  description: string;
  manageHint: string;
  viewHint: string;
  addLabel: string;
  emptyLabel: string;
  emptyManageHint: string;
  newTitle: string;
  editTitle: string;
  createLabel: string;
  idPrefix: string;
  createError: string;
  updateError: string;
  deleteBlocked: string;
  deleteTitle: string;
  deleteConfirm: (name: string) => string;
  deleteError: string;
};
