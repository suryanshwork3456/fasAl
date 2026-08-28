import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import CreateFieldForm from "@/components/fields/CreateFieldForm";
export default function NewField(){return <><Navbar dashboard/><Sidebar/><main className="lg:ml-64"><div className="container-fasai py-5"><CreateFieldForm/></div></main></>}
