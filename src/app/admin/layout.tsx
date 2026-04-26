import AdminNav from "./AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
