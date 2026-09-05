import { useMemo } from "react";
import { CalendarDays, Mail, UserCircle } from "lucide-react";

import Sidebar from "../components/Sidebar";

function Profile() {
  const merchant = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("merchant") || "{}");
    } catch {
      return {};
    }
  }, []);

  const name = merchant.name || "User";
  const email = merchant.email || "user@example.com";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-[276px] min-h-screen w-[calc(100%-276px)] overflow-x-hidden">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 text-gray-500">
              Manage your account information.
            </p>
          </div>

          <section className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 border-b border-gray-100 pb-7 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white">
                {initials || <UserCircle size={38} />}
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
                <p className="mt-1 text-gray-500">Merchant account</p>
              </div>
            </div>

            <div className="grid gap-5 pt-7 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Mail size={17} />
                  Email address
                </div>
                <p className="mt-2 break-words font-medium text-gray-900">
                  {email}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <CalendarDays size={17} />
                  Member since
                </div>
                <p className="mt-2 font-medium text-gray-900">
                  {merchant.createdAt
                    ? new Date(merchant.createdAt).toLocaleDateString()
                    : "Account active"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;
