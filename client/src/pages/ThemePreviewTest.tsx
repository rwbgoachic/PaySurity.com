import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import ThemeTestButton from '../components/theme/ThemeTestButton';

const ThemePreviewTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <ThemeTestButton />
      
      <div className="py-8">
        <Container>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Theme Preview Test</h1>
            <p className="text-xl text-muted-foreground">
              Use the theme preview panel to customize the appearance of this page in real-time.
            </p>
          </div>
          
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Card 1 */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Processing</CardTitle>
                  <CardDescription>Secure and reliable payment solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Our payment processing solutions offer industry-leading security with competitive rates and seamless integration options.</p>
                </CardContent>
                <CardFooter>
                  <button className="btn btn-primary rounded-md px-4 py-2">Learn More</button>
                </CardFooter>
              </Card>
              
              {/* Sample Card 2 */}
              <Card>
                <CardHeader>
                  <CardTitle>BistroBeast POS</CardTitle>
                  <CardDescription>Restaurant management made simple</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>BistroBeast is a complete restaurant point-of-sale solution with inventory management, table service, and online ordering.</p>
                </CardContent>
                <CardFooter>
                  <button className="btn btn-primary rounded-md px-4 py-2">Learn More</button>
                </CardFooter>
              </Card>
              
              {/* Sample Card 3 */}
              <Card>
                <CardHeader>
                  <CardTitle>Digital Wallet</CardTitle>
                  <CardDescription>Modern financial management</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Our digital wallet solution offers secure storage, quick transfers, and comprehensive tracking for personal and business finances.</p>
                </CardContent>
                <CardFooter>
                  <button className="btn btn-primary rounded-md px-4 py-2">Learn More</button>
                </CardFooter>
              </Card>
            </div>
          </Section>
          
          <Section className="mt-12">
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">UI Elements Preview</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    <button className="btn btn-primary rounded-md px-4 py-2">Primary Button</button>
                    <button className="btn btn-secondary rounded-md px-4 py-2">Secondary Button</button>
                    <button className="border border-input bg-transparent hover:bg-muted rounded-md px-4 py-2">Outline Button</button>
                    <button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-4 py-2">Destructive</button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Text Styles</h3>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold">Heading 1</p>
                    <p className="text-3xl font-bold">Heading 2</p>
                    <p className="text-2xl font-bold">Heading 3</p>
                    <p className="text-xl font-semibold">Heading 4</p>
                    <p className="text-lg">Regular paragraph text</p>
                    <p className="text-sm text-muted-foreground">Small muted text</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Interactive Elements</h3>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="terms" className="w-4 h-4 border-input" />
                      <label htmlFor="terms">Accept terms</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="option1" name="options" className="w-4 h-4 border-input" />
                      <label htmlFor="option1">Option 1</label>
                    </div>
                    
                    <div>
                      <input 
                        type="text" 
                        placeholder="Text input" 
                        className="rounded-md border border-input px-3 py-2 bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </Container>
      </div>
    </div>
  );
};

export default ThemePreviewTest;