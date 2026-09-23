import Link from "next/link";

import type { UserForUi } from "@/lib/actions/users";
import { USER_ROLE_LABEL } from "@/lib/users/access";

type UserListProps = {
  items: UserForUi[];
};

export function UserList({ items }: UserListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No users are listed yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Application users</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 text-slate-800">{row.email}</td>
              <td className="px-4 py-3 text-slate-700">{row.name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-700">{USER_ROLE_LABEL[row.role]}</td>
              <td className="px-4 py-3 text-slate-700">{row.isActive ? "Active" : "Disabled"}</td>
              <td className="px-4 py-3">
                <Link
                  className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/settings/users/${row.id}/edit`}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
