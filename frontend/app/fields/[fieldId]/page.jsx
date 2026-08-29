import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import FieldDetail from "@/components/fields/FieldDetail";

export default async function Page({ params }) {
  const { fieldId } = await params;
  return <>
    <Navbar dashboard />
    <Sidebar />
    <main className="lg:ml-64">
      <div className="container-fasai py-5">
        <FieldDetail id={fieldId} />
      </div>
    </main>
  </>;
}