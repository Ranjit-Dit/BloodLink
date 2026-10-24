import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { CommunityProvider } from "../context/community.context.jsx";
import HomePageLayout from "../pages/layout/home-layout.page.jsx";
import DonorSearchPage from "../pages/donor/donor-search.page.jsx";
import DonorListPage from "../pages/donor/donor-list.page.jsx";
import BloodRequestListPage from "../pages/blood-request/blood-request-list.page.jsx";
import NotFoundPage from "../pages/errors/not-found.page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePageLayout />,
    children: [
      { index: true, element: <DonorSearchPage /> },
      { path: "donors", element: <DonorListPage /> },
      { path: "requests", element: <BloodRequestListPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

const Routing = () => (
  <CommunityProvider>
    <ToastContainer
      position="bottom-right"
      theme="light"
      autoClose={5000}
      newestOnTop
      closeOnClick
    />
    <RouterProvider router={router} />
  </CommunityProvider>
);

export default Routing;
