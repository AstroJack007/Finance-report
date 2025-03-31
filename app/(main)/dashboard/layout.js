import React, { Suspense } from "react";
import DashboardPage from "./page.jsx";
import {BarLoader} from "react-spinners";
const DashboardLayout = () => {
  return (
    <div className="px-5">
    <div>
      <h1 className="text-6xl font-bold gradient-title mb-5">DashBoard</h1>
    </div>
    <Suspense fallback={<BarLoader/>}>
        <DashboardPage/>
    </Suspense>
    </div>
  );
};

export default DashboardLayout;
  