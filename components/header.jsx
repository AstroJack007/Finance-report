import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,} from '@clerk/nextjs'
const header = () => {
  return (
    <div className='fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 broder-b'>

      <nav className='container mx-auto px-4 py-4 flex items-center justify-between'>
        <Link href="">
        <Image
        src={"/logo.png"}
        alt="welth logo"
        height={60}
        width={200}
        className="cursor-pointer"
        />
        </Link>
      
            <SignedOut>
              <SignInButton />
              
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            </nav>
    </div>

    
  )
}

export default header;

