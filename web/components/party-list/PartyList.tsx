"use client";

import { useCallback, useState } from "react";

import { LoadingText } from "@/components/ContentSkeletons";

import { PartyForm } from "./PartyForm";
import { PartyTable } from "./PartyTable";
import type { PartyFormValues, PartyListCopy, PartyRecord } from "./types";
import { usePartyList } from "./usePartyList";

export type { PartyFormValues, PartyListCopy, PartyRecord } from "./types";

type PartyListProps<T extends PartyRecord> = {
  canManage: boolean;
  loadItems: () => Promise<T[]>;
  loadErrorMessage: string;
  emptyForm: () => PartyFormValues;
  toFormValues: (item: T) => PartyFormValues;
  createItem: (values: PartyFormValues) => Promise<T>;
  updateItem: (id: string, values: PartyFormValues) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
  copy: PartyListCopy;
};

export function PartyList<T extends PartyRecord>({
  canManage,
  loadItems,
  loadErrorMessage,
  emptyForm,
  toFormValues,
  createItem,
  updateItem,
  deleteItem,
  copy,
}: PartyListProps<T>) {
  const { items, loading, error, replaceItem, removeItem, prependItem } =
    usePartyList(loadItems, loadErrorMessage);

  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const closeForm = useCallback(() => {
    setFormMode("closed");
    setEditingItem(null);
    setActionError(null);
  }, []);

  const handleSaved = useCallback(
    (item: T) => {
      if (formMode === "edit") {
        replaceItem(item);
      } else {
        prependItem(item);
      }
      closeForm();
    },
    [closeForm, formMode, prependItem, replaceItem],
  );

  const displayError = actionError ?? error;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{copy.title}</h1>
          <p className="mt-1 text-zinc-600">
            {copy.description}
            {canManage ? copy.manageHint : copy.viewHint}
          </p>
        </div>
        {canManage && formMode === "closed" ? (
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setFormMode("create");
              setActionError(null);
            }}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {copy.addLabel}
          </button>
        ) : null}
      </div>

      {displayError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {displayError}
        </p>
      ) : null}

      {formMode !== "closed" ? (
        <div className="mt-6">
          <PartyForm
            item={formMode === "edit" ? editingItem : null}
            emptyForm={emptyForm}
            toFormValues={toFormValues}
            createItem={createItem}
            updateItem={updateItem}
            copy={copy}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      ) : null}

      {loading && items.length === 0 ? (
        <LoadingText />
      ) : items.length === 0 ? (
        <p className="mt-8 text-zinc-600">
          {copy.emptyLabel}
          {canManage ? copy.emptyManageHint : null}
        </p>
      ) : (
        <PartyTable
          items={items}
          canManage={canManage}
          deletingId={deletingId}
          deleteItem={deleteItem}
          copy={copy}
          onEdit={(item) => {
            setEditingItem(item);
            setFormMode("edit");
            setActionError(null);
          }}
          onDeleteStart={setDeletingId}
          onDeleteEnd={() => setDeletingId(null)}
          onDeleted={(id) => {
            removeItem(id);
            setActionError(null);
          }}
          onDeleteError={setActionError}
        />
      )}
    </div>
  );
}
