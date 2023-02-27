import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react'

function signin() {
  return (
    <div className='h-screen bg-gray-900 text-white'>
      <div className='relative m-auto flex h-auto w-full max-w-[543px] flex-col gap-8 rounded-lg bg-gray-900 p-8'>
        <div className='flex flex-col items-center justify-center gap-4'>
          Welcome back! Login below
        </div>
        <form className='grid gap-4 py-4'>
          <div>
            <Label htmlFor="username">
              Username
            </Label>
            <Input id="username" placeholder='Username' className="col-span-3" />
          </div>
          <div>
            <Label htmlFor="password">
              Password
            </Label>
            <Input id="password" type="password" placeholder='Password' className="col-span-3" />
          </div>
          <div>
            <Button variant='outline' type="submit" className='hover:bg-gray-700'>Sign in</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default signin;