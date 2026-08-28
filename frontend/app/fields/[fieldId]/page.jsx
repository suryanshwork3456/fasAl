import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import FieldDetail from "@/components/fields/FieldDetail";
export default async function Page({params}){return <><Navbar dashboard/><Sidebar/><main className="lg:ml-64"><div className="container-fasai py-5"><FieldDetail id={params.fieldId}/></div></main></>}
