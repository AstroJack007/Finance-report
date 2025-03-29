import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "@/components/hero";
import {
  Card,
  CardContent,
 
} from "@/components/ui/card";
import Link from "next/link";
import {testimonialsData,howItWorksData, statsData, featuresData } from "../data/landing";
export default function Home() {
  return (
    <div>
      <Hero />
      <section className="py-20 bg-blue-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((statsData, index) => {
            return (
              <div key={index} className="align-middle text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {statsData.value}
                </div>
                <div className="text-gray-600 text-xl">{statsData.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <p className="mb-12 text-center font-bold text-3xl">Everything you need to manage your finance</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8  ">
        {featuresData.map((featuresData, index) => {
            return (
             <div key={index} className="m-4 p-6">
               <Card className="p-6">
               <CardContent className="pt-4">
                {featuresData.icon}
                <h3 className="text-xl font-bold my-3">{featuresData.title}</h3>
                <p className="text-gray-600">{featuresData.description}</p>
               </CardContent>
                
              </Card>
             </div>
            );
          })}
        </div>
        </div>
      </section>


      <section className="py-20 bg-blue-50">
      <p className="mb-12 text-center font-bold text-3xl">How it Works?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-6 ">
          {howItWorksData.map((howItWorksData, index) => {
            return (
              <div key={index} className="m-4 p-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex justify-center items-center mx-auto mb-4">
                  {howItWorksData.icon}
                </div>
                <div className="font-bold text-xl text-center mb-4">{howItWorksData.title}</div>
                <div className="text-center text-gray-600">{howItWorksData.description}</div>
              </div>
            );
          })}
        </div>
      </section>

       {/* Testimonials Section */}
     <section id="testimonials" className="py-20">
     <div className="container mx-auto px-4">
       <h2 className="text-3xl font-bold text-center mb-16">
         What Our Users Say
       </h2>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {testimonialsData.map((testimonial, index) => (
           <Card key={index} className="p-6">
             <CardContent className="pt-4">
               <div className="flex items-center mb-4">
                 <Image
                   src={testimonial.image}
                   alt={testimonial.name}
                   width={40}
                   height={40}
                   className="rounded-full"
                 />
                 <div className="ml-4">
                   <div className="font-semibold">{testimonial.name}</div>
                   <div className="text-sm text-gray-600">
                     {testimonial.role}
                   </div>
                 </div>
               </div>
               <p className="text-gray-600">{testimonial.quote}</p>
             </CardContent>
           </Card>
         ))}
       </div>
     </div>
   </section>

   {/* CTA Section */}
   <section className="py-20 bg-blue-600">
     <div className="container mx-auto px-4 text-center">
       <h2 className="text-3xl font-bold text-white mb-4">
         Ready to Take Control of Your Finances?
       </h2>
       <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
         Join thousands of users who are already managing their finances
         smarter with Welth
       </p>
       <Link href="/dashboard">
         <Button
           size="lg"
           className="bg-white text-blue-600 hover:bg-blue-50 animate-bounce"
         >
           Start Free Trial
         </Button>
       </Link>
     </div>
   
   </section>
    </div>

    
  );
}
