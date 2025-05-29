import { AdminLayout } from "@/components";
import { lazy } from "react";


export const commonRoutes = [
    {
        path: "/login",
        element: lazy(() => import("@/pages/LoginPage")),
        layout: null // No layout for login page
    },
    {
        path: "/",
        element: lazy(() => import("@/pages/HomePage")),
    },
    {
        path: "*",
        element: lazy(() => import("@/pages/NotFoundPage")),
    },
    {
        path: "admin/user",
        element: lazy(() => import("@/pages/Admin/UserManagerPage")),
        layout : AdminLayout
    }
]