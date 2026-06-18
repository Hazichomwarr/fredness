"use client";

type CategoryDeleteButtonProps = {
  categoryName: string;
  disabled: boolean;
};

export function CategoryDeleteButton({
  categoryName,
  disabled,
}: CategoryDeleteButtonProps) {
  return (
    <button
      className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      title={
        disabled
          ? "Move products before deleting this category"
          : "Delete category"
      }
      onClick={(event) => {
        if (!window.confirm(`Delete ${categoryName}?`)) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
