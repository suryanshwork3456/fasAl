import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default function Dashboard() {
  return <><Navbar dashboard /><Sidebar /><main className="lg:ml-64"><div className="container-fasai py-5"><DashboardOverview /></div></main></>;
}
