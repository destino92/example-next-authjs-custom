import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react'
import { getProviders, signIn } from "next-auth/react"

function signin() {
  return (
    <div className='h-screen'>
      <div className='relative m-auto flex h-auto w-full max-w-[543px] flex-col gap-8 rounded-lg bg-slate-50 p-8'>
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
            <Button onClick={async (event) => {
                    const x = await signIn("credentials",
                      {
                        redirect: false,
                        username, password,
                        callbackUrl: 'http://localhost:3000'
                      })
                      .then((data) => {
                        console.log("****signin ok: ", data)
                        if (data.error) {
                          console.log("ERRROR: ", data.error)
                        }
                        //Some front logic here...
                      })
                      .catch((error) => {
                        console.log("*****error adminInitiateAuth: ", error)
                        console.log(JSON.stringify(error))
                        //Some front logic here...
                      })

                    return x
                  }} variant='outline' type="submit">Sign in</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default signin;