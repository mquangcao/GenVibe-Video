import React, { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import { commonRoutes } from './common'
import { mapLayout } from './mapLayout'

function AppRoutes () {
    const element = useRoutes(mapLayout(commonRoutes))
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      {element}
    </Suspense>
  )
}

export default AppRoutes 