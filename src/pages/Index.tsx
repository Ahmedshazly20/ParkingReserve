import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { MdLocalParking, MdLogin, MdDashboard, MdExitToApp } from 'react-icons/md'

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <MdLocalParking className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">WeLink Cargo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced Parking Reservation System with real-time monitoring, automated check-in/checkout, 
            and comprehensive admin controls.
          </p>
        </div>

        {/* System Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-available rounded-xl flex items-center justify-center mx-auto mb-3">
                <MdLocalParking className="h-6 w-6 text-available-foreground" />
              </div>
              <CardTitle>Gate Check-in</CardTitle>
              <CardDescription>
                Visitor and subscriber parking check-in with real-time zone availability
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                <p>• Real-time zone status</p>
                <p>• Subscription validation</p>
                <p>• Automated gate control</p>
              </div>
              <Link to="/gate/gate_1">
                <Button className="w-full">
                  Access Gate 1
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mx-auto mb-3">
                <MdExitToApp className="h-6 w-6 text-warning-foreground" />
              </div>
              <CardTitle>Checkpoint</CardTitle>
              <CardDescription>
                Employee station for processing vehicle checkout and payments
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                <p>• QR ticket scanning</p>
                <p>• Rate calculations</p>
                <p>• Subscription verification</p>
              </div>
              <Link to="/checkpoint">
                <Button variant="outline" className="w-full">
                  <MdLogin className="h-4 w-4 mr-2" />
                  Employee Login Required
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                <MdDashboard className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                System management, reports, and real-time monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                <p>• Parking state reports</p>
                <p>• Zone management</p>
                <p>• Employee accounts</p>
              </div>
              <Link to="/admin">
                <Button variant="outline" className="w-full">
                  <MdLogin className="h-4 w-4 mr-2" />
                  Admin Login Required
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Demo Information */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-center">Demo Credentials</CardTitle>
              <CardDescription className="text-center">
                Use these credentials to explore the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Administrator</h3>
                  <p className="text-sm text-muted-foreground mb-2">Full system access</p>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    <div>Username: admin</div>
                    <div>Password: admin123</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Employee</h3>
                  <p className="text-sm text-muted-foreground mb-2">Checkpoint access only</p>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    <div>Username: employee</div>
                    <div>Password: emp123</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Index;
