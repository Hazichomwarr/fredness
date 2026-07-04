"use client";

type CategoryMergeButtonProps = {
  disabled: boolean;
};

export function CategoryMergeButton({ disabled }: CategoryMergeButtonProps) {
  return (
    <button
      className="rounded-md border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      title={disabled ? "Add another category before merging" : "Merge category"}
      onClick={(event) => {
        if (
          !window.confirm(
            "Move all products from this category into the selected category, then delete this category?",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      Merge
    </button>
  );
}
