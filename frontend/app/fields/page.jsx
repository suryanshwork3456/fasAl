import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import FieldList from "@/components/fields/FieldList";
export default function Fields(){return <><Navbar dashboard/><Sidebar/><main className="lg:ml-64"><div className="container-fasai py-5"><FieldList/></div></main></>}
