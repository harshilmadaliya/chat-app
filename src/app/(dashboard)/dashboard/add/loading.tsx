import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function loading() {
  return (
   <div className='w-full m-2 mt-32 ml-6 md:m-6 flex flex-col gap-3'>
    <Skeleton className='mb-4' height={60} width={500} />
    <Skeleton height={20} width={150} />
    <Skeleton height={50} width={400}/>
   </div>
  )
}

export default loading