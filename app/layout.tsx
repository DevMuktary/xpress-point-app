import type { Metadata } from 'next';
import './globals.css'; // We import our new styles

export const metadata: Metadata = {
  title: 'Xpress Point',
  description: 'Your Hub for Digital, Reliable, Secure Services',
};

/*
  This RootLayout wraps every page. 
  The "children" prop is whatever page Next.js is trying to render.
*/
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* We can add a shared Header or Sidebar here later */}
        {/* <MyHeader /> */}
        
        <main>
          {children} {/* This is where your pages will be rendered */}
        </main>
        
        {/* <MyFooter /> */}
      </body>
    </html>
  );
}
