"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import  Link  from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
    //const imageRef = useRef (null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        //const imageElement = imageRef.current;

        const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  },  []);
    
  return (

    <section className="w-full pt-36 md:pt-48 pb-10">
       <div className='space-y-6 text-center'>
        <div className='space-y-6 mx-auto'>
            <h1 className='text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl
            gradient-title'>
                Your Personal AI Coach for
                <br />
                Professional Career Success
            </h1>
            <p className='mx-auto max-w-[600px] text-muted-foreground md:text-xl'>
                Advance your career with tailored guidance, expert interview prep, 
                and AI-powered tools to achieve job success.
            </p>
        </div>
        <div className='flex justify-center space-x-4'>
            <Link href= "/dashboard">
                <Button size="lg" className="px-8">
                    Get Started
                </Button>
            </Link>
        </div>
        <div className='hero-image-wrapper mt-5 md:mt-0'>
            <div className={scrolled ? 'hero-image-scrolled' : 'hero-image'}>
                <Image 
                src={"/banner1.jpeg"}
                width={1280}
                height={720}
                alt='Banner upnext'
                className='rounded-lg 2xl border mx-auto'
                priority/>
            </div>
        </div>
       </div>
    </section>
  )
}

export default HeroSection