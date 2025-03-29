"use client";
import React, { useEffect, useRef } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
const Hero = () => {
    const imageRef= useRef();

    useEffect(() => {
        const imageElement = imageRef.current;
        
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;
            
            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add("scrolled");
            } else {
                imageElement.classList.remove("scrolled");
            }
        };
    
       
        window.addEventListener('scroll', handleScroll);
    
   
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
  return (
    <div className=" flex items-center justify-center my-20 ">
      <div className="conatiner text-center my-2">
      <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title mb-2 leading-tight">
          Manage your Finances <br /> with Intelligence
        </h1>
        <p className="text-xl py-4 mb-4 mx-auto max-w-2xl ">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>

        <div>
            <Link href='/dashboard'> 
                <Button size='lg' className='mb-2 px-8'>Get Started</Button>
             </Link>
        </div>
        <div className="hero-image-wrapper">
            <div  ref={imageRef} className="hero-image">
                <Image src="/banner.jpeg" width={1280}
                height={720}
                alt="Dashboard Preview" priority
                className="px-8"></Image>
            </div>
        </div>
      </div>
    </div>
  )

}
export default Hero;

<script src="script.js" ></script>