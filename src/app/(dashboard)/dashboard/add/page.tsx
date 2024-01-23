import AddFriendButton from '@/components/AddFriendButton'
import React from 'react'

function page() {
  return (
    <main className='mt-32 ml-6 md:mt-8 md:ml-6'>
        <h1 className='font-bold text-2xl md:text-5xl mb-8'>Add a friend</h1>
        <AddFriendButton/>
    </main>
  )
}

export default page