import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-white">
        Sign out
      </button>
    </form>
  );
}
