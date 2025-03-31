import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, PenBox } from 'lucide-react';
import { SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { checkUser } from '@/lib/checkUser';
import { Button } from "@/components/ui/button";
const header = async() => {
  await checkUser();
  return (
    <div className='border-1 border-black fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 '>

      <nav className='container mx-auto px-4 py-4 flex items-center justify-between'>
        <Link href="">
        <Image
        src={"/logo.png"}
        alt="welth logo"
        height={60}
        width={200}
        className="h-12 w-48 object-contain"
        />
        </Link>
      <div className='flex items-center space-x-4'> 
            <SignedIn>

              <Link href={'/dashboard'}>
              <Button variant='outline' className={'flex items-center gap-2'}> 
                <LayoutDashboard size={'18'}/>
                <span className='hidden md:inline'>Dashboard</span>
              </Button>
              </Link>

              <Link href={'/transaction/create'}>
              <Button className={'flex items-center gap-2'}> 
                <PenBox size={'18'}/>
                <span className='hidden md:inline'>Add Transaction</span>
              </Button>
              </Link>
            </SignedIn>
        
      <SignedOut>
              <SignInButton forceRedirectUrl='/dashboard'>
                    <Button variant="outline">Login</Button>
              </SignInButton >
              
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
              />
            </SignedIn>
      </div>
            </nav>
    </div>
 
    
  )
}

export default header;

